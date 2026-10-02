import ts from "typescript";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync, existsSync } from "fs";
import { createHash } from "crypto";
import { gzipSync } from "zlib";
import { join } from "path";

const root = process.cwd();
const sourcePath = root + "/data/cbpro-release/js/cbpro-app-36daf9df6bc4.r20261001b.js";
let source = readFileSync(sourcePath, "utf8");
// Reviewed function replacements keep the incumbent's hooks, data and actions,
// while allowing genuine route markup reconstruction before dependency splitting.
const incumbentAst=ts.createSourceFile('incumbent.js',source,ts.ScriptTarget.Latest,true);
const replacements=[];
for(const node of incumbentAst.statements){
  if(!ts.isFunctionDeclaration(node)||!node.name)continue;
  const override=root+'/src/reconstruction/routes/'+node.name.text+'.js';
  if(existsSync(override))replacements.push({start:node.getStart(incumbentAst),end:node.end,text:readFileSync(override,'utf8')});
}
for(const r of replacements.sort((a,b)=>b.start-a.start))source=source.slice(0,r.start)+r.text+source.slice(r.end);
// Removed products must not remain reachable through saved/direct URLs.
const routeAst=ts.createSourceFile('routes.js',source,ts.ScriptTarget.Latest,true);
const removedRoutes=[];
function removeRetiredRoutes(node){
  if(ts.isCallExpression(node)&&node.arguments.length>=2&&node.arguments[0].getText(routeAst)==='Route'&&ts.isObjectLiteralExpression(node.arguments[1])){
    const path=node.arguments[1].properties.find(p=>ts.isPropertyAssignment(p)&&p.name.getText(routeAst)==='path');
    if(path&&ts.isStringLiteral(path.initializer)&&/^\/(fantasy(?:-public)?|draft)(?:\/|$)/.test(path.initializer.text)){
      removedRoutes.push({start:node.getStart(routeAst),end:node.end,path:path.initializer.text});return;
    }
  }
  ts.forEachChild(node,removeRetiredRoutes);
}
removeRetiredRoutes(routeAst);
for(const r of removedRoutes.sort((a,b)=>b.start-a.start))source=source.slice(0,r.start)+'null'+source.slice(r.end);
console.log('Retired Fantasy/Draft route registrations removed: '+removedRoutes.length);
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const pages = ["AuthRoute","SignupWizard","Onboarding","ResetPassword","Index","PlayerPublic","TeamPublic","TournamentsPublic","PlayersPublic","TeamsPublic","OrgsPublic","OrganizationRequest","FederationPublic","TournamentPublic","BlogPostPublic","RegulationsPublic","PrivacyPolicy","DeleteAccount","MarketplaceHub","TransfersPublic","RecruitmentPublic","ChampionsPublic","CreditsPurchaseSuccess","StripeCheckoutPage","StripeConnectReturn","CreditsPurchaseCanceled","RankedPublic","FantasyPublic","FantasyMarketPublic","FantasyLeaguePublic","RnkPlayersPublic","SlugPublic","ProtectedRoute","Dashboard","Games","GameDetail","Profiles","Teams","Invites","Tournaments","TournamentDetail","MyCollection","DraftArena","DraftCreate","DraftDetail","TorneioFacil","TorneioFacilCreate","Friendlies","RankedLeaderboard","FantasyHub","FantasyLeagueDetail","OrgManage","MyOrgs","SocialMedia","AdminRoute","NotFound","Login","AppLayout","AdminPanel"];
// These dialogs have no standalone trigger; their parent owns opening them.
// Load report/export libraries only when the relevant dialog is opened.
pages.push("ReportMatchModal", "DashboardQuickCenter");
const deferredDialogs = new Set(["ReportMatchModal", "DashboardQuickCenter"]);
const pageSet = new Set(pages);

function bindingNames(node, out) {
  if (!node) return;
  if (ts.isIdentifier(node)) out.add(node.text);
  else if (ts.isObjectBindingPattern(node) || ts.isArrayBindingPattern(node)) for (const el of node.elements) if (ts.isBindingElement(el)) bindingNames(el.name, out);
}
function descendant(node, id) {
  if (!node) return false;
  if (node === id) return true;
  let found = false;
  function walk(x) { if (x === id) found = true; else ts.forEachChild(x, walk); }
  walk(node);
  return found;
}
function skipIdent(n) {
  const parent = n.parent;
  if (!parent) return false;
  if (ts.isPropertyAccessExpression(parent) && parent.name === n) return true;
  if (ts.isPropertyAssignment(parent) && parent.name === n) return true;
  if (ts.isBindingElement(parent) && parent.propertyName === n) return true;
  if ((ts.isFunctionDeclaration(parent) || ts.isClassDeclaration(parent) || ts.isFunctionExpression(parent) || ts.isClassExpression(parent)) && parent.name === n) return true;
  if (ts.isVariableDeclaration(parent) && parent.name && descendant(parent.name, n) && !(parent.initializer && descendant(parent.initializer, n))) return true;
  if (ts.isParameter(parent) && parent.name && descendant(parent.name, n)) return true;
  if (ts.isBindingElement(parent) && parent.name && descendant(parent.name, n)) return true;
  if (ts.isExportSpecifier(parent)) return true;
  return false;
}
function freeIdents(node) {
  const scopeStack = [new Set()];
  const free = new Set();
  function has(name) { for (let i = scopeStack.length - 1; i >= 0; i--) if (scopeStack[i].has(name)) return true; return false; }
  function collectLocal(body, s) {
    function walk(n) {
      if (n !== body && (ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isClassDeclaration(n) || ts.isClassExpression(n))) return;
      if (ts.isVariableDeclaration(n)) bindingNames(n.name, s);
      if ((ts.isFunctionDeclaration(n) || ts.isClassDeclaration(n)) && n.name) s.add(n.name.text);
      if (ts.isCatchClause(n) && n.variableDeclaration) bindingNames(n.variableDeclaration.name, s);
      ts.forEachChild(n, walk);
    }
    walk(body);
  }
  function visit(n) {
    if (ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n) || ts.isArrowFunction(n) || ts.isMethodDeclaration(n) || ts.isConstructorDeclaration(n) || ts.isGetAccessorDeclaration(n) || ts.isSetAccessorDeclaration(n)) {
      const s = new Set();
      scopeStack.push(s);
      for (const p of n.parameters) bindingNames(p.name, s);
      if (n.body) collectLocal(n.body, s);
      ts.forEachChild(n, c => { if (c !== n.name) visit(c); });
      scopeStack.pop();
      return;
    }
    if (ts.isClassDeclaration(n) || ts.isClassExpression(n)) {
      const s = new Set(); scopeStack.push(s); if (n.name) s.add(n.name.text); ts.forEachChild(n, visit); scopeStack.pop(); return;
    }
    if (ts.isCatchClause(n)) {
      const s = new Set(); scopeStack.push(s); if (n.variableDeclaration) bindingNames(n.variableDeclaration.name, s); visit(n.block); scopeStack.pop(); return;
    }
    if (ts.isIdentifier(n)) { if (!skipIdent(n) && !has(n.text)) free.add(n.text); return; }
    ts.forEachChild(n, visit);
  }
  visit(node);
  return free;
}

const nodes = [];
const byName = new Map();
sf.statements.forEach((st, i) => {
  const names = new Set();
  if ((ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) && st.name) names.add(st.name.text);
  else if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) bindingNames(d.name, names);
  const kind = ts.SyntaxKind[st.kind];
  const node = { i, names: [...names], start: st.pos, end: st.end, deps: freeIdents(st), kind, text: source.slice(st.pos, st.end) };
  nodes.push(node);
  for (const n of names) { if (!byName.has(n)) byName.set(n, []); byName.get(n).push(node); }
});

const effectKinds = new Set(['ExpressionStatement','ForStatement','ForOfStatement','ForInStatement','IfStatement','Block','TryStatement','WhileStatement','DoStatement','SwitchStatement']);
const effectNodes = nodes.filter(n=>effectKinds.has(n.kind) && !n.text.includes('createRoot(document.getElementById'));
function sideEffectsFor(node) { return effectNodes.filter(effect=>node.names.some(name=>effect.deps.has(name))); }
const exportStmt = nodes.find(n => n.kind === "ExportDeclaration");
const exportMap = new Map();
if (exportStmt) {
  const body = exportStmt.text.replace(/^[\s\S]*?export\s*\{/, "").replace(/\}\s*;?\s*$/, "");
  for (const part of body.split(",")) {
    const bit = part.trim();
    if (!bit) continue;
    const m = bit.match(/^([A-Za-z0-9_$]+)\s+as\s+([A-Za-z0-9_$]+)$/);
    if (m) exportMap.set(m[2], m[1]);
    else if (/^[A-Za-z0-9_$]+$/.test(bit)) exportMap.set(bit, bit);
  }
}
const neededExports = new Set();
const jsDir = root + "/data/cbpro-release/js";
for (const file of readdirSync(jsDir)) {
  if (!file.endsWith(".js") || file === "cbpro-app-36daf9df6bc4.r20261001b.js") continue;
  const text = readFileSync(join(jsDir, file), "utf8");
  const re = /import\s*\{([^}]+)\}\s*from\s*"\.\/(?:cbpro-app-36daf9df6bc4|index-CL0UsMlE\.rw7div)\.r20261001b\.js"/g;
  let m;
  while ((m = re.exec(text))) {
    for (const part of m[1].split(",")) {
      const bit = part.trim();
      const mm = bit.match(/^([A-Za-z0-9_$]+)(?:\s+as\s+[A-Za-z0-9_$]+)?$/);
      if (mm) neededExports.add(mm[1]);
    }
  }
}
const neededLocals = [...neededExports].map(n => exportMap.get(n)).filter(Boolean);

function expand(seeds, blockNames) {
  const seen = new Set();
  const q = [];
  function add(n) { if (n && !seen.has(n)) { seen.add(n); q.push(n); } }
  for (const name of seeds) for (const n of byName.get(name) || []) add(n);
  for (const n of nodes) if (n.text.includes("createRoot(document.getElementById")) add(n);
  const runtime = new Set(["react","react_production_min","jsxRuntime","reactJsxRuntime_production_min","scheduler","scheduler_production_min","reactDom","reactDom_production_min"]);
  for (const n of nodes) if (!n.names.length && n.kind !== "ExportDeclaration" && [...n.deps].some(d => runtime.has(d))) add(n);
  while (q.length) {
    const n = q.pop();
    for (const effect of sideEffectsFor(n)) add(effect);
    for (const d of n.deps) {
      if (blockNames.has(d)) continue;
      for (const t of byName.get(d) || []) add(t);
    }
  }
  return seen;
}

const shell = expand(new Set(["App", ...neededLocals]), pageSet);
const shellNames = new Set();
for (const n of shell) for (const name of n.names) shellNames.add(name);

function closureFrom(name, block) {
  const seen = new Set();
  const q = [];
  for (const n of byName.get(name) || []) if (!shell.has(n)) { seen.add(n); q.push(n); }
  while (q.length) {
    const n = q.pop();
    for (const effect of sideEffectsFor(n)) if (!shell.has(effect) && !seen.has(effect)) {seen.add(effect);q.push(effect);}
    for (const d of n.deps) {
      if (block.has(d) || shellNames.has(d)) continue;
      for (const t of byName.get(d) || []) if (!shell.has(t) && !seen.has(t)) { seen.add(t); q.push(t); }
    }
  }
  return seen;
}

const outDir = root + "/data/reconstruction-js";
mkdirSync(outDir, { recursive: true });
const routeFiles = new Map();
const report = [];
const routeClosures=new Map();
for(const page of pages){const block=new Set(pages);block.delete(page);routeClosures.set(page,closureFrom(page,block));}
const consumersByNode=new Map(nodes.map(node=>[node,new Set(pages.filter(page=>routeClosures.get(page).has(node)))]));
const mutableEdges=[];
for(const node of nodes){
  const statement=sf.statements[node.i];
  function findWrites(n){
    let target;
    if(ts.isBinaryExpression(n)&&n.operatorToken.kind>=ts.SyntaxKind.FirstAssignment&&n.operatorToken.kind<=ts.SyntaxKind.LastAssignment)target=n.left;
    if((ts.isPrefixUnaryExpression(n)||ts.isPostfixUnaryExpression(n))&&(n.operator===ts.SyntaxKind.PlusPlusToken||n.operator===ts.SyntaxKind.MinusMinusToken))target=n.operand;
    if(target&&ts.isIdentifier(target)&&node.deps.has(target.text))for(const owner of byName.get(target.text)||[])if(!shell.has(owner)&&!shell.has(node))mutableEdges.push([node,owner]);
    ts.forEachChild(n,findWrites);
  }
  findWrites(statement);
}
// Imported bindings are read-only: a mutable binding and every writer must
// stay in the same module. Propagate their combined consumers through deps.
let grew=true;
while(grew){grew=false;
  function include(target,values){const set=consumersByNode.get(target);for(const value of values)if(!set.has(value)){set.add(value);grew=true;}}
  for(const [writer,owner] of mutableEdges){const both=new Set([...consumersByNode.get(writer),...consumersByNode.get(owner)]);include(writer,both);include(owner,both);}
  for(const node of nodes)if(!shell.has(node))for(const name of node.deps)for(const dep of byName.get(name)||[])if(!shell.has(dep)&&!pageSet.has(name))include(dep,consumersByNode.get(node));
}
for(const [node,consumers] of consumersByNode)for(const page of consumers)routeClosures.get(page).add(node);
// Share declarations by their exact consumers. Dependencies necessarily have
// at least those consumers, so larger consumer sets are emitted first.
const groups=new Map(),nodeGroup=new Map();
for(const node of nodes){
  const consumers=pages.filter(page=>consumersByNode.get(node).has(page));
  if(consumers.length<2)continue;
  const key=consumers.join('|');
  if(!groups.has(key))groups.set(key,{consumers,nodes:[],file:null});
  const group=groups.get(key);group.nodes.push(node);nodeGroup.set(node,group);
}
function importsFor(ordered,currentGroup){
  const globalNames=new Set(),imports=new Map();
  for(const node of ordered)for(const name of node.deps){
    if(shellNames.has(name)){globalNames.add(name);continue;}
    for(const dep of byName.get(name)||[]){const group=nodeGroup.get(dep);if(!group||group===currentGroup)continue;
      if(!group.file)throw new Error('Shared dependency order missing for '+name);
      if(!imports.has(group.file))imports.set(group.file,new Set());imports.get(group.file).add(name);
    }
  }
  // Effect-only groups also need evaluation even when no binding is referenced.
  return [...imports].map(([file,names])=>`import {${[...names].join(',')}} from "./${file}";`).join('\n')+'\n'+`const {${[...globalNames].filter(n=>/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(n)).join(',')}} = globalThis;\n`;
}
const sharedReport=[];
for(const group of [...groups.values()].sort((a,b)=>b.consumers.length-a.consumers.length)){
  const ordered=group.nodes.sort((a,b)=>a.start-b.start);
  const names=[...new Set(ordered.flatMap(n=>n.names))];
  const code=importsFor(ordered,group)+ordered.map(n=>n.text).join('\n')+`\nexport {${names.join(',')}};\n`;
  group.file='shared-'+createHash('sha256').update(code).digest('hex').slice(0,10)+'.js';
  writeFileSync(join(outDir,group.file),code);
  sharedReport.push({file:group.file,raw:code.length,gz:gzipSync(code).length,consumers:group.consumers});
}
for (const page of pages) {
  const block = new Set(pages);
  block.delete(page);
  const set = routeClosures.get(page);
  if (!set.size) { report.push({ page, raw: 0, gz: 0, missing: true }); continue; }
  const ordered = [...set].filter(n=>!nodeGroup.has(n)).sort((a, b) => a.start - b.start);
  const used = new Set();
  for (const n of ordered) for (const d of n.deps) if (shellNames.has(d)) used.add(d);
  const locals = [...used].filter(n => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(n));
  const body = ordered.map(n => n.text).join("\n");
  const effectImports=[...new Set([...set].filter(n=>nodeGroup.has(n)).map(n=>nodeGroup.get(n).file))].map(file=>`import "./${file}";`).join('\n');
  const code = effectImports+'\n'+importsFor(ordered,null)+body+`\nexport default ${page};\n`;
  const hash = createHash("sha256").update(code).digest("hex").slice(0, 8);
  const file = `route-${page}.${hash}.js`;
  writeFileSync(join(outDir, file), code);
  routeFiles.set(page, file);
  report.push({ page, raw: code.length, gz: gzipSync(Buffer.from(code)).length, file, stmts: ordered.length });
}

let entry = [...shell].filter(n => n.kind !== "ExportDeclaration").sort((a, b) => a.start - b.start).map(n => {
  if (n.names.includes("App")) {
    let text = n.text;
    for (const page of pages) {
      if (!routeFiles.has(page)) continue;
      text = text.replaceAll(`jsxRuntimeExports.jsx(${page},`, `jsxRuntimeExports.jsx(Lazy${page},`);
      text = text.replaceAll(`jsxRuntimeExports.jsxs(${page},`, `jsxRuntimeExports.jsxs(Lazy${page},`);
    }
    return text;
  }
  return n.text;
}).join("\n");

const lazyLines = [`const __lazyRoute=(load,deferClosed=false)=>{const C=reactExports.lazy(load);return function LazyRoute(props){if(deferClosed&&!props.open)return null;return jsxRuntimeExports.jsx(reactExports.Suspense,{fallback:null,children:jsxRuntimeExports.jsx(C,props)});};};`];
for (const [page, file] of routeFiles) lazyLines.push(`const Lazy${page}=__lazyRoute(()=>import("./${file}"),${deferredDialogs.has(page)});`);
lazyLines.push(`Object.assign(globalThis,{${[...routeFiles.keys()].map(name=>`${name}:Lazy${name}`).join(",")}});`);
const assignNames = [...shellNames].filter(n => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(n) && n !== "default");
lazyLines.push(`Object.assign(globalThis,{${assignNames.join(",")}});`);
const marker = "createRoot(document.getElementById";
const at = entry.indexOf(marker);
if (at < 0) throw new Error("createRoot missing from entry");
entry = entry.slice(0, at) + lazyLines.join("\n") + "\n" + entry.slice(at);
const kept = [];
for (const [exp, local] of exportMap) if (shellNames.has(local)) kept.push(local === exp ? local : `${local} as ${exp}`);
if (kept.length) entry += `\nexport{${kept.join(",")}};\n`;
const entryHash = createHash("sha256").update(entry).digest("hex").slice(0, 8);
const entryFile = `index-${entryHash}.js`;
writeFileSync(join(outDir, entryFile), entry);

for (const file of readdirSync(jsDir)) {
  if (!file.endsWith(".js") || file === "cbpro-app-36daf9df6bc4.r20261001b.js") continue;
  let text = readFileSync(join(jsDir, file), "utf8");
  text = text.replaceAll('from"./cbpro-app-36daf9df6bc4.r20261001b.js"', `from"./${entryFile}"`).replaceAll('from"./index-CL0UsMlE.rw7div.r20261001b.js"',`from"./${entryFile}"`);
  writeFileSync(join(outDir, file), text);
}
const missing = [...neededExports].filter(n => !exportMap.has(n) || !shellNames.has(exportMap.get(n)));
const entryGz = gzipSync(Buffer.from(entry)).length;
writeFileSync(join(outDir, "manifest.json"), JSON.stringify({ entry: entryFile, entryRaw: entry.length, entryGz, missingExports: missing, routes: report, shared:sharedReport }, null, 2));
console.log(JSON.stringify({ entry: entryFile, entryRaw: entry.length, entryGz, routes: report.length, missing: missing.length, biggest: report.sort((a,b)=>b.gz-a.gz).slice(0,8) }, null, 2));
