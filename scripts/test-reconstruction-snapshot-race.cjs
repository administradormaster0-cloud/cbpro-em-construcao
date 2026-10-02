const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('data/cbpro-reconstruction/index.html','utf8');
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('cbproEarlySnapshot'));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function run({brokenRpc=false,expiredStorage=false}){
 const context={window:{},location:{pathname:'/'},AbortSignal,Date,Promise,Error,Array,fetch:async url=>{
  const rpc=url.includes('/rpc/');await pause(rpc?1:10);
  return {ok:true,json:async()=>{await pause(rpc?140:5);if(rpc&&brokenRpc)throw Error('Invalid JSON');return{entries:[],source:rpc?'rpc':'storage',refreshed_at:new Date(Date.now()-(expiredStorage&&!rpc?240000:0)).toISOString()}}};
 }};
 vm.runInNewContext(script,context);
 return await context.window.cbproEarlySnapshot.promise;
}
(async()=>{
 assert.equal((await run({})).source,'storage','Complete storage body wins over earlier RPC headers');
 assert.equal((await run({brokenRpc:true})).source,'storage','Broken competing response does not prevent valid cache');
 assert.equal((await run({expiredStorage:true})).source,'rpc','Expired cache must not win the race');
 console.log('PASS: complete response race, malformed response fallback, expired snapshot fallback.');
})().catch(e=>{console.error(e);process.exitCode=1});
