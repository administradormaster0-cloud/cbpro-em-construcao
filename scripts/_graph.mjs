import ts from "typescript";
import { readFileSync } from "fs";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const t0 = performance.now();
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const pages = new Set(["AuthRoute","SignupWizard","Onboarding","ResetPassword","Index","PlayerPublic","TeamPublic","TournamentsPublic","PlayersPublic","TeamsPublic","OrgsPublic","OrganizationRequest","FederationPublic","TournamentPublic","BlogPostPublic","RegulationsPublic","PrivacyPolicy","DeleteAccount","MarketplaceHub","TransfersPublic","RecruitmentPublic","ChampionsPublic","CreditsPurchaseSuccess","StripeCheckoutPage","StripeConnectReturn","CreditsPurchaseCanceled","RankedPublic","FantasyPublic","FantasyMarketPublic","FantasyLeaguePublic","RnkPlayersPublic","SlugPublic","ProtectedRoute","Dashboard","Games","GameDetail","Profiles","Teams","Invites","Tournaments","TournamentDetail","MyCollection","DraftArena","DraftCreate","DraftDetail","TorneioFacil","TorneioFacilCreate","Friendlies","RankedLeaderboard","FantasyHub","FantasyLeagueDetail","OrgManage","MyOrgs","SocialMedia","AdminRoute","NotFound","Login","AppLayout","AdminPanel"]);
function isId(node){return ts.isIdentifier(node);}
function bindingNames(node, out){
  if(!node) return;
  if(ts.isIdentifier(node)) out.add(node.text);
  else if(ts.isObjectBindingPattern(node)||ts.isArrayBindingPattern(node)) for(const el of node.elements) if(ts.isBindingElement(el)) bindingNames(el.name, out);
  else if(ts.isVariableDeclaration(node)) bindingNames(node.name, out);
  else if(ts.isFunctionDeclaration(node)||ts.isClassDeclaration(node)) { if(node.name) out.add(node.name.text); }
}
function collectScopeBindings(node, scope){
  if(ts.isFunctionDeclaration(node)||ts.isFunctionExpression(node)||ts.isArrowFunction(node)||ts.isMethodDeclaration(node)||ts.isConstructorDeclaration(node)||ts.isGetAccessor(node)||ts.isSetAccessor(node)){
    for(const p of node.parameters||[]) bindingNames(p.name, scope);
  }
  ts.forEachChild(node, child => {
    if(ts.isVariableDeclaration(child)) bindingNames(child.name, scope);
    else if((ts.isFunctionDeclaration(child)||ts.isClassDeclaration(child)) && child.name) scope.add(child.name.text);
    else if(ts.isCatchClause(child) && child.variableDeclaration) bindingNames(child.variableDeclaration.name, scope);
    collectScopeBindings(child, scope);
  });
}
function freeIdents(node){
  const scopeStack = [new Set()];
  const free = new Set();
  function addScope(extra){ const s=new Set(extra); scopeStack.push(s); return s; }
  function has(name){ for(let i=scopeStack.length-1;i>=0;i--) if(scopeStack[i].has(name)) return true; return false; }
  function visit(n){
    if(ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isMethodDeclaration(n)||ts.isConstructorDeclaration(n)||ts.isGetAccessorDeclaration(n)||ts.isSetAccessorDeclaration(n)){
      const s=addScope();
      for(const p of n.parameters) bindingNames(p.name, s);
      // local decls in body
      const body = n.body;
      if(body) collectLocal(body, s);
      if(n.name && ts.isFunctionDeclaration(n)) {} 
      for(const p of n.parameters) if(p.initializer||p.type) {}
      ts.forEachChild(n, c => { if(c!==n.name) visit(c); });
      scopeStack.pop();
      return;
    }
    if(ts.isClassDeclaration(n)||ts.isClassExpression(n)){
      const s=addScope();
      if(n.name) s.add(n.name.text);
      ts.forEachChild(n, visit);
      scopeStack.pop();
      return;
    }
    if(ts.isCatchClause(n)){
      const s=addScope();
      if(n.variableDeclaration) bindingNames(n.variableDeclaration.name, s);
      visit(n.block);
      scopeStack.pop();
      return;
    }
    if(ts.isIdentifier(n)){
      const parent=n.parent;
      if(parent && ts.isPropertyAccessExpression(parent) && parent.name===n) return;
      if(parent && ts.isPropertyAssignment(parent) && parent.name===n) return;
      if(parent && (ts.isFunctionDeclaration(parent)||ts.isClassDeclaration(parent)||ts.isFunctionExpression(parent)||ts.isClassExpression(parent)) && parent.name===n) return;
      if(parent && ts.isVariableDeclaration(parent) && nameNodeHas(parent.name, n)) return;
      if(parent && ts.isBindingElement(parent) && nameNodeHas(parent.name, n)) return;
      if(parent && ts.isParameter(parent) && nameNodeHas(parent.name, n)) return;
      if(parent && ts.isImportSpecifier(parent)) return;
      if(parent && ts.isExportSpecifier(parent)) return;
      if(!has(n.text)) free.add(n.text);
      return;
    }
    ts.forEachChild(n, visit);
  }
  function nameNodeHas(nameNode, id){ if(!nameNode) return false; if(nameNode===id) return true; let found=false; function w(x){ if(x===id) found=true; else ts.forEachChild(x,w);} w(nameNode); return found; }
  function collectLocal(body, s){
    function walk(n){
      if(n!==body && (ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isClassDeclaration(n)||ts.isClassExpression(n))) return;
      if(ts.isVariableDeclaration(n)) bindingNames(n.name, s);
      if((ts.isFunctionDeclaration(n)||ts.isClassDeclaration(n)) && n.name) s.add(n.name.text);
      if(ts.isCatchClause(n) && n.variableDeclaration) bindingNames(n.variableDeclaration.name, s);
      ts.forEachChild(n, walk);
    }
    walk(body);
  }
  visit(node);
  return free;
}
const nodes = [];
const byName = new Map();
sf.statements.forEach((st, i) => {
  const names = new Set();
  if(ts.isFunctionDeclaration(st)||ts.isClassDeclaration(st)) { if(st.name) names.add(st.name.text); }
  else if(ts.isVariableStatement(st)) for(const d of st.declarationList.declarations) bindingNames(d.name, names);
  else if(ts.isFirstStatement && false) {}
  const textStart = st.getStart(sf), textEnd = st.end;
  const node = { i, names:[...names], start: textStart, end: textEnd, bytes: textEnd-textStart, deps: freeIdents(st), kind: ts.SyntaxKind[st.kind] };
  nodes.push(node);
  for(const n of names) {
    if(!byName.has(n)) byName.set(n, []);
    byName.get(n).push(node);
  }
});
console.log("nodes", nodes.length, "bindings", byName.size, "parse+free ms", Math.round(performance.now()-t0));
const dups = [...byName.entries()].filter(([,v])=>v.length>1);
console.log("duplicate binding names", dups.length, dups.slice(0,15).map(([n,v])=>n+":"+v.length).join(" "));
function reachable(cutPages){
  const seen = new Set();
  const q = [];
  const render = nodes.find(n => source.slice(n.start, Math.min(n.end, n.start+80)).includes("createRoot") || source.slice(n.start, n.end).includes("BrowserRouter,{children"));
  // seed all statements that contain the router if huge statement
  for(const n of nodes) if(source.slice(n.start, n.end).includes("BrowserRouter,{children")) q.push(n);
  // also top-level side effect statements? not yet
  while(q.length){
    const n = q.pop();
    if(seen.has(n)) continue;
    seen.add(n);
    for(const d of n.deps){
      if(cutPages && pages.has(d) && d!=="Index") continue;
      const targets = byName.get(d);
      if(!targets) continue;
      for(const t of targets) if(!seen.has(t)) q.push(t);
    }
  }
  let bytes=0; for(const n of seen) bytes+=n.bytes;
  return {count: seen.size, bytes};
}
const all = reachable(false);
const cut = reachable(true);
console.log("reachable from router", all);
console.log("reachable cutting other pages", cut);
// expression statements not reached
const renderNodes = nodes.filter(n => source.slice(n.start, n.end).includes("BrowserRouter,{children"));
console.log("render nodes", renderNodes.map(n=>({kind:n.kind, bytes:n.bytes, names:n.names.slice(0,6)})));
const side = nodes.filter(n => !["FunctionDeclaration","ClassDeclaration","VariableStatement","FirstStatement","ExportDeclaration"].includes(n.kind));
console.log("side statements", side.map(n=>({kind:n.kind, bytes:n.bytes, deps:[...n.deps].slice(0,8)})));
