const fs=require('fs');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Mateus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:1536,height:1024}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5191/');
  await page.waitForFunction(()=>document.documentElement.dataset.programData==='ready');
  await page.locator('[data-status="FINISHED"]').click();
  assert.equal(await page.locator('[data-status="FINISHED"]').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('[data-region="schedule-row-0"]').getAttribute('href'),/^\/tournament\/[a-f0-9-]+$/);
  await page.locator('[data-status="REG_OPEN"]').click();
  await page.locator('[data-region="theme-toggle"]').click();
  assert.equal(await page.locator('[data-region="theme-toggle"]').getAttribute('aria-pressed'),'true');
  await page.reload();
  await page.waitForFunction(()=>document.documentElement.dataset.programData==='ready');
  assert.equal(await page.locator('[data-region="theme-toggle"]').getAttribute('aria-pressed'),'true');
  await page.locator('[data-region="theme-toggle"]').click();
  const result=await page.evaluate(()=>({data:document.documentElement.dataset.programData,bodyPadding:getComputedStyle(document.body).paddingTop,headline:['title-copa','title-starter','title-sorriso','title-de-ouro'].map(id=>document.querySelector(`[data-region="${id}"]`).textContent).join(' '),news:document.querySelector('[data-region="news-main-open"]').getAttribute('href'),club:document.querySelector('[data-region="rank-name-0"]').getAttribute('href')}));
  assert.equal(result.bodyPadding,'0px');assert.match(result.news,/^\/blog\/[a-f0-9-]+$/);assert.match(result.club,/^\/t\/[a-f0-9-]+$/);
  await page.screenshot({path:'.impeccable/review/hero-semantic.png'});
  await page.goto('http://127.0.0.1:5191/teams-public');
  await page.waitForFunction(()=>document.documentElement.classList.contains('program-secondary'));
  await page.locator('.cbpro-directory-heading').waitFor({state:'visible',timeout:15000});
  assert.equal(await page.locator('#cbpro-program').isVisible(),false);
  assert.equal(await page.locator('#root').isVisible(),true);
  assert.deepEqual(errors,[]);
  fs.writeFileSync('.impeccable/reconstruction/semantic-smoke.json',JSON.stringify({at:new Date().toISOString(),...result,tabs:true,themePersistence:true,secondaryRouteVisible:true,errors},null,2));
  console.log('Live Supabase content, schedule tabs, saved theme, verified detail links and secondary-route visibility passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
