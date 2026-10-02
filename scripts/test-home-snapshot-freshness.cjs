const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync('scripts/reconstruction-semantic-client.js','utf8');
const start=source.indexOf('const loadSnapshot=');const end=source.indexOf('const shared=',start);assert(start>=0&&end>start);
async function check(refreshed_at){const context={fetch:async()=>({ok:true,json:async()=>({entries:[],refreshed_at})}),AbortSignal,Date,Array,Error,mediaRoot:'https://example.invalid/'};vm.createContext(context);vm.runInContext(source.slice(start,end)+'globalThis.load=loadSnapshot;',context);return context.load()}
(async()=>{await check(new Date().toISOString());await assert.rejects(check(new Date(Date.now()-7*3600000).toISOString()),/desatualizado/);await assert.rejects(check('invalid'),/desatualizado/);console.log('PASS: fresh data accepted, stale and invalid timestamps rejected by actual home loader')})().catch(e=>{console.error(e);process.exitCode=1});
