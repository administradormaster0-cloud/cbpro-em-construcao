import ts from "typescript";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from "fs";
import { createHash } from "crypto";
import { gzipSync } from "zlib";
import { join } from "path";

const root = "D:/FC CLUBS";
const sourcePath = root + "/site/js/index-CL0UsMlE.rw7div.js";
const source = readFileSync(sourcePath, "utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const pages = ["AuthRoute","SignupWizard","Onboarding","ResetPassword","Index","PlayerPublic","TeamPublic","TournamentsPublic","PlayersPublic","TeamsPublic","OrgsPublic","OrganizationRequest","FederationPublic","TournamentPublic","BlogPostPublic","RegulationsPublic","PrivacyPolicy","DeleteAccount","MarketplaceHub","TransfersPublic","RecruitmentPublic","ChampionsPublic","CreditsPurchaseSuccess","StripeCheckoutPage","StripeConnectReturn","CreditsPurchaseCanceled","RankedPublic","FantasyPublic","FantasyMarketPublic","FantasyLeaguePublic","RnkPlayersPublic","SlugPublic","ProtectedRoute","Dashboard","Games","GameDetail","Profiles","Teams","Invites","Tournaments","TournamentDetail","MyCollection","DraftArena","DraftCreate","DraftDetail","TorneioFacil","TorneioFacilCreate","Friendlies","RankedLeaderboard","FantasyHub","FantasyLeagueDetail","OrgManage","MyOrgs","SocialMedia","AdminRoute","NotFound","Login","AppLayout","AdminPanel"];
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
const jsDir = root + "/site/js";
for (const file of readdirSync(jsDir)) {
  if (!file.endsWith(".js") || file === "index-CL0UsMlE.rw7div.js") continue;
  const text = readFileSync(join(jsDir, file), "utf8");
  const re = /import\s*\{([^}]+)\}\s*from\s*"\.\/index-CL0UsMlE\.rw7div\.js"/g;
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
    for (const d of n.deps) {
      if (block.has(d) || shellNames.has(d)) continue;
      for (const t of byName.get(d) || []) if (!shell.has(t) && !seen.has(t)) { seen.add(t); q.push(t); }
    }
  }
  return seen;
}

const outDir = root + "/fcclubs/data/public-js";
mkdirSync(outDir, { recursive: true });
const routeFiles = new Map();
const report = [];
for (const page of pages) {
  const block = new Set(pages);
  block.delete(page);
  const set = closureFrom(page, block);
  if (!set.size) { report.push({ page, raw: 0, gz: 0, missing: true }); continue; }
  const ordered = [...set].sort((a, b) => a.start - b.start);
  const used = new Set();
  for (const n of ordered) for (const d of n.deps) if (shellNames.has(d)) used.add(d);
  const locals = [...used].filter(n => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(n));
  const body = ordered.map(n => n.text).join("\n");
  const code = `const {${locals.join(",")}} = globalThis;\n${body}\nexport default ${page};\n`;
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

const lazyLines = [`const __lazyRoute=(load)=>{const C=reactExports.lazy(load);return function LazyRoute(props){return jsxRuntimeExports.jsx(reactExports.Suspense,{fallback:null,children:jsxRuntimeExports.jsx(C,props)});};};`];
for (const [page, file] of routeFiles) lazyLines.push(`const Lazy${page}=__lazyRoute(()=>import("./${file}"));`);
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
  if (!file.endsWith(".js") || file === "index-CL0UsMlE.rw7div.js") continue;
  let text = readFileSync(join(jsDir, file), "utf8");
  text = text.replaceAll('from"./index-CL0UsMlE.rw7div.js"', `from"./${entryFile}"`);
  writeFileSync(join(outDir, file), text);
}
const missing = [...neededExports].filter(n => !exportMap.has(n) || !shellNames.has(exportMap.get(n)));
const entryGz = gzipSync(Buffer.from(entry)).length;
writeFileSync(join(outDir, "manifest.json"), JSON.stringify({ entry: entryFile, entryRaw: entry.length, entryGz, missingExports: missing, routes: report }, null, 2));
console.log(JSON.stringify({ entry: entryFile, entryRaw: entry.length, entryGz, routes: report.length, missing: missing.length, biggest: report.sort((a,b)=>b.gz-a.gz).slice(0,8) }, null, 2));
