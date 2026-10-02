import {readdirSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,basename,dirname,sep} from 'node:path';
import {all,db,dataDir} from '../server/db.mjs';
const site=fileURLToPath(new URL('../../site/assets/img/',import.meta.url));
const bundled=new Set(readdirSync(site).flatMap(n=>[n,n.replace(/\.[a-z0-9]+(?=\.[^.]+$)/,'')]));
const sourceHost='pkoysigjsorpefekkiqf.supabase.co',legacyHost='bjgfpygzmosxahvcqrwe.supabase.co';
const specs=[
 ['player_profiles','photo_object_key','player-photos'],['teams','emblem_object_key','team-emblems'],['games','logo_object_key','game-logos'],
 ['federations','logo_url','federation-logos'],['tournaments','logo_object_key','tournament-logos'],['tournaments','trophy_image_object_key','trophy-images'],
 ['tournaments','cover_object_key','tournament-covers'],['hero_mascot_settings','image_object_key','hero-mascot'],
 ['manual_titles','trophy_image_object_key','manual-title-trophies'],['performance_achievement_types','icon_object_key','trophies'],
 ['avatar_gallery','image_object_key','player-photos'],['avatar_nfts','image_object_key','player-photos'],['player_card_gallery','image_object_key','player-photos'],
 ['org_templates','preview_image_key','template-previews'],['federation_blog_posts','cover_image_object_key','federation-blog'],
 ['federation_gallery','image_object_key','federation-gallery'],['federation_customizations','bg_image_object_key','federation-bgs'],
];
const queue=[],seen=new Set(),references=[];
function add(value,bucket){
 if(typeof value!=='string'||!value)return;let key,host=sourceHost;
 if(value.startsWith('https://')){let url;try{url=new URL(value);}catch{return;}if(![sourceHost,legacyHost].includes(url.hostname))return;host=url.hostname;key=url.pathname.split('/object/public/')[1];if(!key)return;key=decodeURIComponent(key);}
 else if(bucket)key=bucket+'/'+value;else return;
 const file=resolve(dataDir,'uploads',key);if(!file.startsWith(resolve(dataDir,'uploads')+sep)||seen.has(key))return;seen.add(key);
 const available=existsSync(file)||bundled.has(basename(key));references.push({key,available});if(!available)queue.push({key,file,host});
}
for(const [table,field,bucket]of specs)for(const row of all(table))add(row[field],bucket);
function walk(value){if(typeof value==='string'){if(value.startsWith('https://'))add(value);}else if(value&&typeof value==='object')for(const item of Object.values(value))walk(item);}
for(const {doc} of db.prepare('select doc from records').iterate())walk(JSON.parse(doc));
let index=0,bytes=0,downloaded=0;const failures=[];
async function worker(){while(index<queue.length){const job=queue[index++];try{
 let response;for(const host of [...new Set([sourceHost,job.host])]){response=await fetch(`https://${host}/storage/v1/object/public/`+job.key.split('/').map(encodeURIComponent).join('/'),{signal:AbortSignal.timeout(30000)});if(response.ok)break;await response.arrayBuffer();}
 if(!response.ok)throw Error('HTTP '+response.status);const type=response.headers.get('content-type')?.split(';')[0];if(!type?.startsWith('image/'))throw Error('Not an image');
 const body=Buffer.from(await response.arrayBuffer());if(body.length>20e6)throw Error('Image exceeds 20 MB');mkdirSync(dirname(job.file),{recursive:true});writeFileSync(job.file,body);writeFileSync(job.file+'.mime',type);bytes+=body.length;downloaded++;
 if(downloaded%25===0)console.log(`Cached ${downloaded}/${queue.length} (${Math.round(bytes/1e6)} MB)`);
 }catch(error){failures.push({key:job.key,error:error.message});}}}
await Promise.all(Array.from({length:4},worker));
const report={at:new Date().toISOString(),references:references.length,already_available:references.filter(r=>r.available).length,requested:queue.length,downloaded,bytes,failures};
writeFileSync(resolve(dataDir,'media-report.json'),JSON.stringify(report,null,2));writeFileSync(resolve(dataDir,'media-manifest.json'),JSON.stringify(references,null,2));console.log(JSON.stringify(report));
