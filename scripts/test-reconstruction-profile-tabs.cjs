const fs=require('fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Mateus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch(),results=[];
 try{
  const snapshot=JSON.parse(fs.readFileSync('.impeccable/reconstruction/public-home-snapshot.json','utf8'));
  const player=snapshot.entries.find(e=>e.args?.p_collection==='player_profiles'&&e.result?.rows?.length)?.result.rows[0];
  assert(player?.id);
  for(const route of ['/t/54c67868-2694-4419-b895-e280a8756b72','/p/'+player.id]){
   const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:5191'+route);await page.locator('.cbpro-profile').waitFor({timeout:20000});
   const tabs=page.getByRole('tab'),tested=[];
   for(let i=0;i<await tabs.count();i++){
    const tab=tabs.nth(i),label=await tab.innerText();await tab.click();assert.equal(await tab.getAttribute('aria-selected'),'true');
    const panelId=await tab.getAttribute('aria-controls');
    if(panelId)await page.locator('[id="'+panelId+'"]').waitFor({timeout:10000});
    else assert((await page.locator('.cbpro-profile').innerText()).length>100,'Profile content must remain after selecting '+label);
    tested.push({label,panelLinked:!!panelId});
   }
   await page.setViewportSize({width:390,height:844});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
   assert.equal(overflow,false);assert.deepEqual(errors,[]);
   await page.screenshot({path:'.impeccable/review/'+(route.startsWith('/t/')?'club':'player')+'-profile-mobile.png',fullPage:true});
   results.push({route,tabs:tested,overflow,errors});await page.close();
  }
  fs.writeFileSync('.impeccable/reconstruction/profile-tabs-smoke.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
