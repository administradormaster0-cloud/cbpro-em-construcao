const {chromium}=require('C:/Users/Mateus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');(async()=>{let b=await chromium.launch();let p=await b.newPage();p.on('pageerror',e=>console.log(e.stack));p.on('response',r=>{if(r.status()>399)console.log(r.status(),r.url())});await p.goto('http://127.0.0.1:5187');await p.waitForTimeout(8000);await b.close()})();

