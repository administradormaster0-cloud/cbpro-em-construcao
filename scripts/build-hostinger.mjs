import {readFileSync,writeFileSync,readdirSync,mkdirSync,copyFileSync,statSync} from 'node:fs';
import {join,relative,dirname} from 'node:path';
import {emailLoginPage} from '../server/email-login-page.mjs';
process.loadEnvFile('.env.supabase.local');const root=process.env.SUPABASE_URL,anon=process.env.SUPABASE_ANON_KEY;
const out='data/hostinger-release';mkdirSync(out,{recursive:true});
function rewrite(s){return s.replaceAll('https://pkoysigjsorpefekkiqf.supabase.co',root).replaceAll('https://bjgfpygzmosxahvcqrwe.supabase.co',root).replaceAll('sb_publishable_UANCv-yxe0ndcLf13IbuMg_o4F1meIo',anon);}
const aliases={};
function copyTree(source,target){mkdirSync(target,{recursive:true});for(const d of readdirSync(source,{withFileTypes:true})){const from=join(source,d.name),to=join(target,d.name);if(d.isDirectory()){copyTree(from,to);continue;}if(d.name.endsWith('.mime'))continue;
 if(/\.(js|css)$/.test(d.name))writeFileSync(to,rewrite(readFileSync(from,'utf8')));else copyFileSync(from,to);
 const simple=d.name.replace(/\.[a-z0-9]+(?=\.[^.]+$)/,'');if(simple!==d.name)aliases[relative(out,join(target,simple)).replaceAll('\\','/')]=relative(out,to).replaceAll('\\','/');}}
const entry=readdirSync('data/public-js').find(n=>/^index-[a-f0-9]+\.js$/.test(n));if(!entry)throw Error('missing split entry');
copyTree('data/public-js',out+'/js');for(const dir of ['css','assets'])copyTree('../site/'+dir,out+'/'+dir);
let html=rewrite(readFileSync('../site/index.html','utf8')).replace(/<script data-sitecloner[^>]*>[\s\S]*?<\/script>/g,'').replace(/(src|href)="(js\/|css\/|assets\/)/g,'$1="/$2').replace('<head>','<head><base href="/"><script src="/fc-cloud.js"></script>');html=html.replace('index-CL0UsMlE.rw7div.js',entry);writeFileSync(out+'/index.html',html);
let script=readFileSync('cloud/frontend.js','utf8').replace('__SUPABASE_URL__',JSON.stringify(root)).replace('__SUPABASE_ANON_KEY__',JSON.stringify(anon));writeFileSync(out+'/fc-cloud.js',script);
const code=emailLoginPage().replace('<head>','<head><script src="/fc-cloud.js"></script>').replace("'sb-'+location.hostname.split('.')[0]+'-auth-token'",JSON.stringify('sb-'+new URL(root).hostname.split('.')[0]+'-auth-token'));writeFileSync(out+'/login-code.html',code);
mkdirSync(out+'/manage',{recursive:true});copyTree('dist/assets',out+'/manage/assets');let manage=readFileSync('dist/manage.html','utf8').replace('<head>','<head><script src="/fc-cloud.js"></script>');writeFileSync(out+'/manage/index.html',manage);
const rules=['Options -Indexes','DirectoryIndex index.html','<IfModule mod_rewrite.c>','RewriteEngine On','RewriteRule ^login-code/?$ login-code.html [L]'];
for(const [from,to]of Object.entries(aliases))if(from!==to)rules.push('RewriteRule ^'+from.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$ '+to+' [L]');
rules.push('RewriteCond %{REQUEST_FILENAME} !-f','RewriteCond %{REQUEST_FILENAME} !-d','RewriteRule ^ index.html [L]','</IfModule>','<IfModule mod_headers.c>','<FilesMatch "\\.(?:js|css|png|jpe?g|webp|gif|svg|woff2|ico)$">','Header set Cache-Control "public, max-age=31536000, immutable"','</FilesMatch>','<FilesMatch "^(index\\.html|fc-cloud\\.js|login-code\\.html)$">','Header set Cache-Control "no-cache"','</FilesMatch>','Header set X-Content-Type-Options "nosniff"','Header set Referrer-Policy "strict-origin-when-cross-origin"','</IfModule>');writeFileSync(out+'/.htaccess',rules.join('\n')+'\n');
writeFileSync(out+'/deployment.json',JSON.stringify({at:new Date().toISOString(),backend:root,edge:'fc-api',local_runtime:false}));
console.log({directory:out,aliases:Object.keys(aliases).length});
