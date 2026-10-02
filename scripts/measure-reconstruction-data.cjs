const fs=require('fs');
const {chromium}=require('C:/Users/Mateus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const checks=[['/','Hype'],['/teams-public','CaçaCatiorra'],['/players-public','Rambo'],['/champions','Streammers League'],['/tournaments-public','SORRISO DE OURO']];
(async()=>{const browser=await chromium.launch(),results=[];
try{for(const [route,needle] of checks){const context=await browser.newContext();
for(const mode of ['cold','warm']){const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));const started=Date.now();
await page.goto('http://127.0.0.1:5191'+route,{waitUntil:'domcontentloaded'});
let ready=true;await page.waitForFunction(needle=>document.querySelector('#root')?.innerText.toLowerCase().includes(needle.toLowerCase()),needle,{timeout:15000}).catch(()=>ready=false);
const result=await page.evaluate(()=>({navigation:performance.getEntriesByType('navigation').map(r=>({responseEnd:r.responseEnd,domInteractive:r.domInteractive})),resources:performance.getEntriesByType('resource').map(r=>({name:r.name.replace(location.origin,''),duration:Math.round(r.duration),responseEnd:Math.round(r.responseEnd),transferSize:r.transferSize,decodedBodySize:r.decodedBodySize})),rootCharacters:document.querySelector('#root')?.innerText.length}));
results.push({route,mode,ready,dataVisibleMs:Date.now()-started,errors,...result});await page.close();}await context.close();}
fs.writeFileSync('.impeccable/reconstruction/data-load-measurements.json',JSON.stringify({measuredAt:new Date().toISOString(),environment:'Loopback static preview; real remote Supabase; fresh context per route; warm HTTP cache on second document visit; no bandwidth throttling.',results},null,2));
console.log(JSON.stringify(results.map(({route,mode,ready,dataVisibleMs,errors,resources})=>({route,mode,ready,dataVisibleMs,errors,slowest:resources.sort((a,b)=>b.responseEnd-a.responseEnd).slice(0,3)})),null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e.message);process.exitCode=1});
