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
  const records=[];
  for(const [index,name] of [[0,'profiles'],[1,'teams']]){
   await page.locator('.cbpro-desk-action').nth(index).click();const panel=page.getByRole('dialog').last();await panel.waitFor();
   const management=panel.locator('.cbpro-management');await management.waitFor();
   records.push({name,phase:'management',buttons:await panel.getByRole('button').allTextContents(),text:await management.innerText()});
   await page.screenshot({path:'.impeccable/review/management-'+name+'-desktop.png',fullPage:true});
   const create=panel.getByRole('button',{name:/Novo perfil|Novo Profile|New profile|Criar time|Create team|Novo time|New team/i}).first();
   if(await create.count()){
    await create.click();await page.waitForTimeout(300);const form=page.getByRole('dialog').last();
    assert((await form.innerText()).includes('127.0.0.1:5191/'),'Slug prefix must use current site host');
    assert(!/appgamund\.com\/|fcclubs\.pro\//.test(await form.innerText()),'Obsolete domain in form');
    records.push({name,phase:'create',buttons:await form.getByRole('button').allTextContents(),fields:await form.locator('input,select,textarea,[role="combobox"]').evaluateAll(els=>els.map(el=>({tag:el.tagName,type:el.type,name:el.name,placeholder:el.getAttribute('placeholder'),required:el.required}))),text:await form.innerText()});
    await page.setViewportSize({width:390,height:844});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
    await page.screenshot({path:'.impeccable/review/management-'+name+'-create-mobile.png',fullPage:true});
    await page.keyboard.press('Escape');await page.setViewportSize({width:1440,height:1000});
   }
   for(let attempt=0;attempt<3&&await page.getByRole('dialog').count();attempt++){await page.keyboard.press('Escape');await page.waitForTimeout(100);}
  }
  assert.deepEqual(errors,[]);fs.writeFileSync('.impeccable/reconstruction/management-form-inventory.json',JSON.stringify({checkedAt:new Date().toISOString(),records,errors,scope:'Real create triggers and field inventory, no records submitted; persistence and role cases pending.'},null,2));console.log(JSON.stringify(records));
 }finally{
  if(browser)await browser.close();
  if(session?.access_token)await fetch(url+'/auth/v1/logout?scope=local',{method:'POST',signal:AbortSignal.timeout(15000),headers:{apikey:process.env.SUPABASE_ANON_KEY,Authorization:'Bearer '+session.access_token}}).catch(()=>{});
 }
})().catch(e=>{console.error(e.stack);process.exitCode=1;});

