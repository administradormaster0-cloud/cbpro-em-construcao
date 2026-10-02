const fs=require('fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Mateus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch();try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5191/tournament/fee18a3c-5cb7-48ce-9c6b-8acb407e9e01');await page.locator('.cbpro-event').waitFor({timeout:20000});
 const tabs=page.getByRole('tab'),checked=[];
 for(let i=0;i<await tabs.count();i++){const tab=tabs.nth(i),label=await tab.innerText();await tab.click();assert.equal(await tab.getAttribute('aria-selected'),'true');const panel=await tab.getAttribute('aria-controls');assert(panel);await page.locator('[id="'+panel+'"]').waitFor();checked.push(label.trim());}
 await page.setViewportSize({width:390,height:844});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
 await page.screenshot({path:'.impeccable/review/tournament-mobile.png',fullPage:true});
 const login=page.getByRole('button',{name:/Faça login para se inscrever/i});await login.click();await page.waitForURL('**/login');assert.deepEqual(errors,[]);
 const result={at:new Date().toISOString(),tabs:checked,mobileOverflow:overflow,registrationLoginEntry:true,errors,scope:'Public tab navigation and login entry; no registration or payment submitted.'};
 fs.writeFileSync('.impeccable/reconstruction/event-action-smoke.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}})().catch(e=>{console.error(e.stack);process.exitCode=1});
