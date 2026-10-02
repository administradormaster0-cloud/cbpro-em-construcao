import {AsyncLocalStorage} from 'node:async_hooks';
import {filters,matches,split,valueAt} from './query.mjs';
const storage=new AsyncLocalStorage();
const context=()=>{const c=storage.getStore();if(!c)throw Error('Missing request context');return c;};
export class Hydration extends Error{constructor(key,args){super('Load cloud data');this.key=key;this.args=args;}}
export const isHydration=e=>e instanceof Hydration;
export const clock=()=>context().time;
export function randomUUID(){const c=context(),i=c.sequence++;return c.ids[i]??(c.ids[i]=crypto.randomUUID());}
export function stableRandom(){const c=context(),i=c.randomSequence++;return c.randoms[i]??(c.randoms[i]=Math.random());}
const compound=(t,id)=>t+'\0'+String(id);
const changes=()=>[...context().writes.values()];
export const requestCache=()=>context().memo;
function query(args){const c=context(),key=JSON.stringify(args);if(!c.reads.has(key))throw new Hydration(key,args);return c.reads.get(key);}
function original(table,filter={op:'and',children:[]},fields=null){
 const full=context().reads.get(JSON.stringify({p_collection:table,p_filter:{op:'and',children:[]},p_limit:100000,p_fields:fields}));
 if(full)return full.rows.filter(row=>matches(row,filter));
 return query({p_collection:table,p_filter:filter,p_limit:100000,p_fields:fields}).rows;
}
function overlay(table,rows){const result=new Map(rows.map(r=>[String(r.id),r]));for(const change of changes()){if(change.collection!==table)continue;if(change.action==='delete')result.delete(change.id);else result.set(change.id,change.doc);}return [...result.values()];}
export function all(table){return overlay(table,original(table));}
export function get(table,id){if(id===null||id===undefined)return null;const change=context().writes.get(compound(table,id));if(change)return change.action==='delete'?null:change.doc;
 return original(table,{key:'id',op:'eq',value:String(id)}).find(r=>String(r.id)===String(id))||null;
}
export function where(table,key,value){field(key);const path=key.replace(/->>?/g,'.');const f={key:path,op:value===null?'is':'eq',value:value===null?'null':String(value)};return overlay(table,original(table,f)).filter(r=>matches(r,f));}
export function save(table,row){const r={...row,id:row.id||row.slug||randomUUID()};context().writes.set(compound(table,r.id),{collection:table,id:String(r.id),action:'save',doc:r});context().memo.clear();return r;}
export function remove(table,id){context().writes.set(compound(table,id),{collection:table,id:String(id),action:'delete'});context().memo.clear();}
export function patch(table,id,updates){const old=get(table,id);if(!old)throw Object.assign(Error('Registro não encontrado'),{status:404});return save(table,{...old,...updates,id:old.id});}
export function log(user,action,table,id){return save('fc_audit',{user_id:user?.id||null,action,collection:table,record_id:id||null,created_at:new Date(clock()).toISOString()});}
export function field(key){if(!/^[a-zA-Z_][\w]*(?:->>?[\w]+)*$/.test(key))throw Object.assign(Error('Campo inválido'),{status:400});return key;}
export function transaction(fn){const c=context(),previous=new Map(c.writes);try{return fn();}catch(e){c.writes=previous;c.memo.clear();throw e;}}
export function selectRows(table,params,{limit=true}={}){const order=split(params.get('order')||'').map(s=>{const [key,direction,empty]=s.split('.');field(key);return {key:key.replace(/->>?/g,'.'),direction,empty};});
 const p_limit=limit?Math.min(10000,Math.max(0,Number(params.get('limit')||1000))):100000,p_offset=limit?Math.max(0,Number(params.get('offset')||0)):0;
 if(!Number.isFinite(p_limit)||!Number.isFinite(p_offset))throw Object.assign(Error('Paginação inválida'),{status:400});
 return query({p_collection:table,p_filter:filters(params),p_order:order,p_limit,p_offset,p_changes:changes()});
}
export function embeddedMatches(row,query,path){const p=new URLSearchParams();for(const [k,v]of query){if(k.startsWith(path+'.')&&!k.slice(path.length+1).includes('.'))p.append(k.slice(path.length+1),v);}return matches(row,filters(p));}
export const db={prepare(sql){
 if(sql==='SELECT total_changes() n')return {get:()=>({n:context().revision})};
 if(sql==='UPDATE accounts SET role=? WHERE id=?')return {run:()=>({changes:0})};
 if(sql.includes("collection='match_eafc_newgen_player_stats'")){const fields=[...sql.matchAll(/json_extract\(doc,'\$\.([^']+)'\) AS (\w+)/g)].map(m=>({key:m[1],alias:m[2]}));return {all:()=>original('match_eafc_newgen_player_stats',undefined,fields)};}
 throw Error('Unsupported cloud query');
}};
export async function runCloud(operation,{request,revision,commit=true,maxPasses=100}){
 const c={reads:new Map(),writes:new Map(),memo:new Map(),ids:[],randoms:[],sequence:0,randomSequence:0,time:Date.now(),revision};
 return storage.run(c,async()=>{for(let pass=0;pass<maxPasses;pass++){c.writes=new Map();c.memo.clear();c.sequence=0;c.randomSequence=0;
  try{const result=operation();if(result instanceof Promise)throw Error('Business operation must be synchronous');const updates=changes();if(updates.length&&commit)await request('fc_runtime_commit',{p_operation:crypto.randomUUID(),p_revision:revision,p_changes:updates});return {result,updates};}
  catch(e){if(!(e instanceof Hydration))throw e;
   const args={...e.args,p_revision:revision},paged=args.p_collection==='match_eafc_newgen_player_stats'&&args.p_fields&&args.p_limit===100000;
   const response=await request('fc_edge_select',{...args,...(paged?{p_limit:1000}: {})});
   if(paged){for(let offset=1000;offset<response.count;offset+=4000){const pages=await Promise.all([0,1,2,3].map(n=>offset+n*1000).filter(n=>n<response.count).map(p_offset=>request('fc_edge_select',{...args,p_limit:1000,p_offset})));for(const page of pages)response.rows.push(...page.rows);}}
   if(response.rows.length<response.count&&e.args.p_limit===100000)throw Object.assign(Error('Consulta excede o limite. Use paginação.'),{status:413});c.reads.set(e.key,response);}
 }throw Object.assign(Error('Consulta muito complexa. Reduza o número de registros.'),{status:413});});
}
