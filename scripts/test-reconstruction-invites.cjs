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
  await page.goto('http://127.0.0.1:5191/invites');const inbox=page.locator('.cbpro-invites');await inbox.waitFor();await inbox.locator('[aria-busy="false"]').waitFor({timeout:20000});const checks=[];
  for(const width of [1440,390]){await page.setViewportSize({width,height:900});for(const label of ['Pendentes','Histórico']){const button=inbox.getByRole('button',{name:new RegExp(label)});await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');const panel=page.locator('#'+(await button.getAttribute('aria-controls')).replaceAll(':','\\:'));assert(await panel.isVisible());assert((await panel.innerText()).trim().length>10);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);checks.push({width,label,panelVisible:true,overflow});}await page.screenshot({path:'.impeccable/review/invites-'+width+'.png',fullPage:true})}
  assert.deepEqual(errors,[]);fs.writeFileSync('.impeccable/reconstruction/invites-layout-smoke.json',JSON.stringify({checkedAt:new Date().toISOString(),checks,errors,scope:'Own admin empty-inbox switching only. No invitation sent/responded. Populated response and persistence cases pending.'},null,2));console.log(JSON.stringify(checks));
 }finally{
  if(browser)await browser.close();
  if(session?.access_token)await fetch(url+'/auth/v1/logout?scope=local',{method:'POST',signal:AbortSignal.timeout(15000),headers:{apikey:process.env.SUPABASE_ANON_KEY,Authorization:'Bearer '+session.access_token}}).catch(()=>{});
 }
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
