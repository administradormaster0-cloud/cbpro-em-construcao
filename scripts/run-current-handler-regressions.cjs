const fs=require('fs'),{spawnSync}=require('child_process');
const candidates=fs.readdirSync('scripts').filter(n=>/^test-.*\.cjs$/.test(n));
const tests=candidates.filter(n=>{const s=fs.readFileSync('scripts/'+n,'utf8');return /require\(['"]vm['"]\)/.test(s)&&!/(process\.loadEnvFile|chromium|fetch\(|execSync|spawn\()/i.test(s)});
const report={at:new Date().toISOString(),scope:'Controlled unit tests of actual reconstructed handlers; no live mutations or payment settlement',results:[]};
for(const test of tests){const r=spawnSync(process.execPath,['scripts/'+test],{encoding:'utf8',timeout:30000});report.results.push({test,passed:r.status===0,status:r.status,error:r.error?.message,output:(r.stdout+r.stderr).slice(-1200)});console.log((r.status===0?'PASS ':'FAIL ')+test)}
fs.writeFileSync('.impeccable/reconstruction/current-handler-regressions.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.results.filter(r=>r.passed).length,total:tests.length}));if(report.results.some(r=>!r.passed))process.exitCode=1;
