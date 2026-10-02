const fs=require('fs'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Mateus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
process.loadEnvFile('.env.supabase.local');
(async()=>{
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
 let session,browser;
 try{
  let r=await fetch(url+'/auth/v1/admin/generate_link',{method:'POST',headers,signal:AbortSignal.timeout(15000),body:JSON.stringify({type:'magiclink',email:'administradormaster0@gmail.com'})});assert(r.ok);const link=await r.json();
  r=await fetch(url+'/auth/v1/verify',{method:'POST',headers,signal:AbortSignal.timeout(15000),body:JSON.stringify({type:'magiclink',token_hash:link.hashed_token})});assert(r.ok);session=await r.json();
  browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.addInitScript(({session,url})=>localStorage.setItem('sb-'+new URL(url).hostname.split('.')[0]+'-auth-token',JSON.stringify(session)),{session,url});
  const page=await context.newPage(),errors=[],actions=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5191/dashboard');await page.locator('.cbpro-desk-action').first().waitFor({timeout:20000});await page.getByText('Administrador FC Clubs',{exact:true}).waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.goto('http://127.0.0.1:5191/tournaments');const desk=page.locator('.cbpro-competition-desk');await desk.waitFor();await desk.locator('[aria-busy="false"]').waitFor({timeout:20000});const buttons=desk.locator('.cbpro-competition-desk-tools>div').last().getByRole('button');const checks=[];assert((await buttons.count())>=3);
  for(let n=0;n<await buttons.count();n++){const button=buttons.nth(n),label=await button.innerText();await button.click();await page.waitForTimeout(100);assert((await desk.locator('.cbpro-competition-desk-results').innerText()).trim().length>0);checks.push({label,resultVisible:true})}
  const search=desk.locator('input').first();await search.fill('CBPRO_TEST_NO_MATCH_9482');await page.waitForTimeout(300);assert((await desk.locator('.cbpro-competition-desk-results').innerText()).trim().length>0);await search.fill('');
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'.impeccable/review/private-tournaments-mobile.png',fullPage:true});assert.deepEqual(errors,[]);fs.writeFileSync('.impeccable/reconstruction/private-tournaments-smoke.json',JSON.stringify({at:new Date().toISOString(),checks,searchEditable:true,mobileOverflow:false,errors,scope:'Category interaction/render only; registration/payment/save flows still pending.'},null,2));console.log(JSON.stringify(checks));
 }finally{
  if(browser)await browser.close();
  if(session?.access_token)await fetch(url+'/auth/v1/logout?scope=local',{method:'POST',signal:AbortSignal.timeout(15000),headers:{apikey:process.env.SUPABASE_ANON_KEY,Authorization:'Bearer '+session.access_token}}).catch(()=>{});
 }
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
