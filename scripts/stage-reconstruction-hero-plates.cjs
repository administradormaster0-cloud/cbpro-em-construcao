const fs=require('fs');
const target='data/cbpro-reconstruction',spec=JSON.parse(fs.readFileSync('.impeccable/build/spec.json','utf8'));
fs.mkdirSync(target+'/assets/plates',{recursive:true});
const regions=spec.regions.filter(r=>r.plate);
const images=regions.map(r=>{
 fs.copyFileSync(r.plate,target+'/'+r.plate);
 const optimized=r.plate.replace(/\.png$/,'.webp');
 const useOptimized=fs.existsSync(optimized)&&fs.statSync(optimized).mtimeMs>=fs.statSync(r.plate).mtimeMs;
 if(useOptimized)fs.copyFileSync(optimized,target+'/'+optimized);
 const servedPlate=useOptimized?optimized:r.plate;
 const b=r.box||r.pixelBox;
 const pixel=!!r.pixelBox;
 const x=pixel?b.x/spec.compSize.width:b.x,y=pixel?b.y/spec.compSize.height:b.y,w=pixel?b.w/spec.compSize.width:b.w,h=pixel?b.h/spec.compSize.height:b.h;
 const critical=['hero-background','hero-trophy','brand'].includes(r.id);
 return `<img data-region="${r.id}" class="program-plate program-plate--${r.id}" src="/${servedPlate}" alt="" loading="${critical?'eager':'lazy'}" decoding="async" ${r.id==='hero-background'?'fetchpriority="high"':''} style="left:${x*100}%;top:${y*100}%;width:${w*100}%;height:${h*100}%">`;
}).join('\n');
fs.writeFileSync(target+'/cbpro-program.css',`/* Approved second proposal: measured artwork layer. */
.program-plate-frame{position:relative;width:100%;aspect-ratio:1536/1024;background:#f7f8f8;overflow:hidden}
.program-plate-frame::before{content:"";position:absolute;inset:0 0 auto;height:58.69%;background:#08172d}
.program-plate{position:absolute;object-fit:contain;display:block}
.program-plate--hero-background,.program-plate--news-main-image,.program-plate--news-thumb-0,.program-plate--news-thumb-1{object-fit:cover}
body{margin:0}#root{display:none}
`);
let html=fs.readFileSync(target+'/index.html','utf8');
html=html.replace(/<main id="cbpro-program"[\s\S]*?<\/main>/g,'');
html=html.replace(/<link rel="stylesheet" href="\/cbpro-program\.css">/g,'');
html=html.replace(/<script src="\/cbpro-design\.r20261001b\.js"><\/script>/,'');
html=html.replace(/<link rel="stylesheet" href="https:\/\/fonts.googleapis.com[^>]+>/,'');
html=html.replace('</head>','<link rel="stylesheet" href="/cbpro-program.css"></head>');
html=html.replace('<div id="root"></div>',`<main id="cbpro-program" class="program-plate-frame" aria-label="Composição CBPRO em preparação">${images}</main><div id="root"></div>`);
fs.writeFileSync(target+'/index.html',html);
console.log(`Staged ${regions.length} approved plates at measured boxes. This isolated artwork pass is not a published or functional finished page.`);
