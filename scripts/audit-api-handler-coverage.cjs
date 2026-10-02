const fs=require('fs'),ts=require('typescript');
const inventory=JSON.parse(fs.readFileSync('.impeccable/reconstruction/active-api-actions.json'));
const file='supabase/functions/fc-api/rpc.mjs',source=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
const handlers=new Map();
for(const declaration of ast.statements){if(!ts.isFunctionDeclaration(declaration)||!['rpc','invoke'].includes(declaration.name?.text))continue;
 const names=new Set();function walk(node){if(ts.isBinaryExpression(node)&&node.left.getText(ast)==='name'&&ts.isStringLiteralLike(node.right))names.add(node.right.text);
  if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&node.expression.name.text==='includes'&&node.arguments[0]?.getText(ast)==='name'&&ts.isArrayLiteralExpression(node.expression.expression))for(const element of node.expression.expression.elements)if(ts.isStringLiteralLike(element))names.add(element.text);
  ts.forEachChild(node,walk);}walk(declaration);handlers.set(declaration.name.text,names);
}
const rows=inventory.actions.map(action=>{const names=handlers.get(action.kind==='invoke'?'invoke':'rpc')||new Set();let status=names.has(action.name)?'explicit-handler-needs-functional-proof':'no-explicit-handler';
 if(action.kind==='invoke'&&/checkout|stripe|pix|purchase|customer-portal|subscription|generate-|read-match-image|suggest-card/.test(action.name))status='provider-dependent-or-disabled-needs-configuration';
 if(action.name.startsWith('fn_elo_')||['fn_initialize_elo_federation_season','fn_bootstrap_elo_v2_from_legacy'].includes(action.name))status='delegated-elo-handler-needs-functional-proof';
 return {...action,status};});
const report={at:new Date().toISOString(),target:'construction',source:file,rows,dynamicCalls:inventory.dynamic,scope:'Static screening of locally staged handlers only. Explicit presence does not prove correctness or deployment; missing cases require inspection of delegation and frontend reachability.'};
fs.writeFileSync('.impeccable/reconstruction/api-handler-coverage.json',JSON.stringify(report,null,2));console.log(JSON.stringify({total:rows.length,missing:rows.filter(r=>r.status==='no-explicit-handler').map(r=>r.name),providers:rows.filter(r=>r.status.startsWith('provider')).length}));
