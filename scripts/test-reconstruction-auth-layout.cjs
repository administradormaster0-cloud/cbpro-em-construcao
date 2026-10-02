const fs=require('fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Mateus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch(),results=[];try{
 for(const route of ['login','signup']){
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5191/'+route);await page.locator('.cbpro-auth input').first().waitFor();
  const firstOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(firstOverflow,false);
  await page.locator('input[type=email]').fill('layout-check@example.com');await page.locator('input[type=password]').fill('ExampleOnly123!');
  assert.equal(await page.locator('input[type=email]').inputValue(),'layout-check@example.com');
  await page.screenshot({path:'.impeccable/review/'+route+'-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);results.push({route,firstOverflow,fieldsEditable:true,errors});await page.close();
 }
 fs.writeFileSync('.impeccable/reconstruction/auth-layout-smoke.json',JSON.stringify({results,scope:'Rendering and field editing only; no signup/login/email submitted.'},null,2));console.log(JSON.stringify(results));
}finally{await browser.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
