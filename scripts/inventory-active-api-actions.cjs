const fs=require('fs'),path=require('path'),ts=require('typescript');
const root=path.resolve('data/cbpro-reconstruction'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const queue=[...html.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g)].map(m=>path.join(root,m[1]));
const seen=new Set(),actions=new Map(),dynamic=[];
while(queue.length){const file=queue.shift();if(seen.has(file))continue;seen.add(file);const source=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
 for(const m of source.matchAll(/(?:from\s*|import\s*\()(['"])(\.{1,2}\/[^'"]+)\1/g))queue.push(path.resolve(path.dirname(file),m[2].split('?')[0]));
 function walk(node){if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)){
  const kind=node.expression.name.text,receiver=node.expression.expression.getText(ast);
  if((kind==='invoke'&&receiver.endsWith('.functions'))||(kind==='rpc'&&/supabase$/.test(receiver))){const arg=node.arguments[0],location=path.relative(root,file).replaceAll('\\','/');
   if(arg&&ts.isStringLiteralLike(arg)){const key=kind+':'+arg.text;const row=actions.get(key)||{kind,name:arg.text,modules:[]};if(!row.modules.includes(location))row.modules.push(location);actions.set(key,row)}else dynamic.push({kind,module:location,expression:arg?.getText(ast)||''});
  }
 }ts.forEachChild(node,walk)}walk(ast);
}
const report={at:new Date().toISOString(),target:'construction',reachableModules:seen.size,actions:[...actions.values()].sort((a,b)=>a.name.localeCompare(b.name)),dynamic,scope:'Static inventory of calls in the active reachable module graph. Each action still requires backend, role and persistence validation.'};
fs.writeFileSync('.impeccable/reconstruction/active-api-actions.json',JSON.stringify(report,null,2));console.log(JSON.stringify({modules:seen.size,actions:report.actions.length,dynamic:dynamic.length,functions:report.actions.filter(x=>x.kind==='invoke').map(x=>x.name)}));
