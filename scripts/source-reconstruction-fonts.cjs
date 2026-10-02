const fs=require('fs');
const root='data/cbpro-reconstruction/assets/fonts';fs.mkdirSync(root,{recursive:true});
(async()=>{const request='https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Phudu:wght@400;500;600;700;800;900&display=swap';
const response=await fetch(request,{headers:{'User-Agent':'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36'},signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error(response.status);let css=await response.text();const origins=[];
for(const remote of [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))]){const r=await fetch(remote,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error(r.status);const file='program-'+remote.split('/').pop();const data=Buffer.from(await r.arrayBuffer());fs.writeFileSync(root+'/'+file,data);css=css.split(remote).join('/assets/fonts/'+file);origins.push({file,origin:remote,bytes:data.length});}
fs.writeFileSync('data/cbpro-reconstruction/cbpro-fonts.css',css);fs.writeFileSync('.impeccable/reconstruction/font-origins.json',JSON.stringify({stylesheet:request,files:origins},null,2));console.log(`Self-hosted ${origins.length} font files; no external font stylesheet needed.`);
})().catch(e=>{console.error(e.message);process.exitCode=1});
