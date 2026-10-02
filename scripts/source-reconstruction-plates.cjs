const fs=require('fs');
const {spawnSync}=require('child_process');
const media=JSON.parse(fs.readFileSync('.impeccable/reconstruction/current-media.json','utf8'));
const jobs=[['news-main-image',media.news[0]],['news-thumb-0',media.news[1]],['news-thumb-1',media.news[2]],['rank-logo-0',media.clubs[1]],['rank-logo-1',media.clubs[0]],['rank-logo-2',media.clubs[2]],...media.trophies.map((m,i)=>[`champion-trophy-${i}`,m])];
(async()=>{
 const results=[];
 for(const [id,m] of jobs){
  const r=await fetch(m.src);if(!r.ok)throw Error(`${id}: ${r.status}`);
  const bytes=Buffer.from(await r.arrayBuffer()),path=`assets/plates/${id}.png`;
  fs.writeFileSync(path,bytes);
  const prompt=`Origin: existing CBPRO public Supabase media, ${m.src}. Content: ${m.alt}. Real records replace the illustrative proposal media; preserve complete emblems and trophies.`;
  fs.writeFileSync(`.impeccable/reconstruction/${id}-origin.txt`,prompt);
  const child=spawnSync('C:/Users/Mateus/.codex/skills/impeccable/scripts/impeccable.cmd',['embed-prompt',path,'--prompt-file',`.impeccable/reconstruction/${id}-origin.txt`],{shell:true,encoding:'utf8'});
  if(child.status!==0)throw Error(child.stderr||child.stdout);
  results.push({id,path,source:m.src,bytes:bytes.length});
 }
 fs.writeFileSync('.impeccable/reconstruction/sourced-plates.json',JSON.stringify(results,null,2));
 console.log(`Sourced and recorded provenance for ${results.length} public media assets.`);
})().catch(e=>{console.error(e);process.exitCode=1});
