const fs=require('fs'),ts=require('typescript'),zlib=require('zlib');
const base='data/cbpro-release',html=fs.readFileSync(base+'/index.html','utf8');
const entry=html.match(/<script type="module" crossorigin src="\/([^\"]+)"/)[1],source=fs.readFileSync(base+'/'+entry,'utf8'),ast=ts.createSourceFile(entry,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const largest=ast.statements.map(n=>({kind:ts.SyntaxKind[n.kind],name:n.name?.text||n.declarationList?.declarations.map(d=>d.name.getText(ast)).join(',')||'',bytes:Buffer.byteLength(n.getFullText(ast))})).sort((a,b)=>b.bytes-a.bytes).slice(0,30);
const routes=[...new Set([...source.matchAll(/path:"([^"\n]+)"/g)].map(m=>m[1]))].sort();
fs.mkdirSync('.impeccable/reconstruction',{recursive:true});const report={date:new Date().toISOString(),entry,rawBytes:Buffer.byteLength(source),gzipBytes:zlib.gzipSync(source).length,parseErrors:ast.parseDiagnostics.length,routes,largest};fs.writeFileSync('.impeccable/reconstruction/runtime-inventory.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
