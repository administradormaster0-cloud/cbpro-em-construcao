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
  assert.equal(await page.locator('.cbpro-desk-action').count(),8);
  await page.screenshot({path:'.impeccable/review/dashboard-reconstructed-desktop.png',fullPage:true});
  for(let index=0;index<8;index++){
   const trigger=page.locator('.cbpro-desk-action').nth(index),label=await trigger.innerText();
   await trigger.click();const dialog=page.getByRole('dialog').last();await dialog.waitFor({timeout:20000});assert((await dialog.innerText()).trim().length>20);
   actions.push({label,opened:true});console.log('Opened '+label);await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden',timeout:10000});
  }
  await page.locator('.cbpro-desk-settings').click();await page.getByRole('dialog').last().waitFor();actions.push({label:'Configurações',opened:true});console.log('Opened Configurações');await page.keyboard.press('Escape');
  await page.locator('.cbpro-desk-report-button').click();
  const reportState=await Promise.any([
   page.getByRole('dialog').last().waitFor({timeout:10000}).then(()=> 'dialog'),
   page.locator('[data-sonner-toast]').filter({hasText:/Create a profile|Crie.*perfil|Criar.*perfil/i}).waitFor({timeout:10000}).then(()=> 'requiresProfileOrTeam')
  ]);
  actions.push({label:'Reportar placar',state:reportState});if(reportState==='dialog')await page.keyboard.press('Escape');
  if(reportState==='requiresProfileOrTeam')assert.equal(await page.locator('[data-sonner-toaster]').first().evaluate(el=>getComputedStyle(el).position),'fixed');
  await page.setViewportSize({width:390,height:844});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
  await page.locator('.cbpro-workspace-menu').click();assert.equal(await page.locator('.cbpro-workspace-menu').getAttribute('aria-expanded'),'true');assert(await page.getByText('Administrador FC Clubs',{exact:true}).isVisible());await page.locator('.cbpro-workspace-menu').click();
  await page.screenshot({path:'.impeccable/review/dashboard-reconstructed-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  const result={at:new Date().toISOString(),actions,mobileOverflow:overflow,mobileMenu:true,errors,scope:'View/open checks only; no purchase, match report or account mutation submitted.'};
  fs.writeFileSync('.impeccable/reconstruction/workspace-action-smoke.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{
  if(browser)await browser.close();
  if(session?.access_token)await fetch(url+'/auth/v1/logout?scope=local',{method:'POST',signal:AbortSignal.timeout(15000),headers:{apikey:process.env.SUPABASE_ANON_KEY,Authorization:'Bearer '+session.access_token}}).catch(()=>{});
 }
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
