const {chromium}=require('C:/Users/Mateus/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');(async()=>{let b=await chromium.launch({headless:true});let p=await b.newPage({viewport:{width:1440,height:1000}});await p.goto('http://127.0.0.1:5187');await p.waitForTimeout(12000);console.log((await p.locator('body').innerText()).slice(0,1600));console.log(await p.locator('header').evaluateAll(xs=>xs.map(x=>({cls:x.className,html:x.outerHTML.slice(0,1000)}))));await p.screenshot({path:'data/original-review.png'});await b.close()})();


