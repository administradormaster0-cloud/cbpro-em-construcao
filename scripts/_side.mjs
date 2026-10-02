import ts from "typescript";
import { readFileSync } from "fs";
import { gzipSync } from "zlib";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const pages = new Set("AuthRoute SignupWizard Onboarding ResetPassword Index PlayerPublic TeamPublic TournamentsPublic PlayersPublic TeamsPublic OrgsPublic OrganizationRequest FederationPublic TournamentPublic BlogPostPublic RegulationsPublic PrivacyPolicy DeleteAccount MarketplaceHub TransfersPublic RecruitmentPublic ChampionsPublic CreditsPurchaseSuccess StripeCheckoutPage StripeConnectReturn CreditsPurchaseCanceled RankedPublic FantasyPublic FantasyMarketPublic FantasyLeaguePublic RnkPlayersPublic SlugPublic ProtectedRoute Dashboard Games GameDetail Profiles Teams Invites Tournaments TournamentDetail MyCollection DraftArena DraftCreate DraftDetail TorneioFacil TorneioFacilCreate Friendlies RankedLeaderboard FantasyHub FantasyLeagueDetail OrgManage MyOrgs SocialMedia AdminRoute NotFound Login AppLayout AdminPanel".split(" "));
function bindingNames(node, out){ if(!node) return; if(ts.isIdentifier(node)) out.add(node.text); else if(ts.isObjectBindingPattern(node)||ts.isArrayBindingPattern(node)) for(const el of node.elements) if(ts.isBindingElement(el)) bindingNames(el.name, out); }
function skipIdent(n){
  const parent=n.parent; if(!parent) return false;
  if(ts.isPropertyAccessExpression(parent) && parent.name===n) return true;
  if(ts.isPropertyAssignment(parent) && parent.name===n) return true;
  if(ts.isBindingElement(parent) && parent.propertyName===n) return true;
  if((ts.isFunctionDeclaration(parent)||ts.isClassDeclaration(parent)||ts.isFunctionExpression(parent)||ts.isClassExpression(parent)) && parent.name===n) return true;
  function descendant(node, id){ if(!node) return false; if(node===id) return true; let f=false; function w(x){ if(x===id) f=true; else ts.forEachChild(x,w);} w(node); return f; }
  if(ts.isVariableDeclaration(parent) && parent.name && descendant(parent.name, n) && !(parent.initializer && descendant(parent.initializer, n))) return true;
  if(ts.isParameter(parent) && parent.name && descendant(parent.name, n)) return true;
  if(ts.isBindingElement(parent) && parent.name && descendant(parent.name, n)) return true;
  return false;
}
function freeIdents(node){
  const scopeStack=[new Set()]; const free=new Set();
  function has(name){ for(let i=scopeStack.length-1;i>=0;i--) if(scopeStack[i].has(name)) return true; return false; }
  function collectLocal(body, s){ function walk(n){ if(n!==body && (ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isClassDeclaration(n)||ts.isClassExpression(n))) return; if(ts.isVariableDeclaration(n)) bindingNames(n.name, s); if((ts.isFunctionDeclaration(n)||ts.isClassDeclaration(n)) && n.name) s.add(n.name.text); if(ts.isCatchClause(n)&&n.variableDeclaration) bindingNames(n.variableDeclaration.name, s); ts.forEachChild(n, walk);} walk(body); }
  function visit(n){
    if(ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isMethodDeclaration(n)||ts.isConstructorDeclaration(n)||ts.isGetAccessorDeclaration(n)||ts.isSetAccessorDeclaration(n)){
      const s=new Set(); scopeStack.push(s); for(const p of n.parameters) bindingNames(p.name, s); if(n.body) collectLocal(n.body, s); ts.forEachChild(n, c=>{ if(c!==n.name) visit(c); }); scopeStack.pop(); return;
    }
    if(ts.isClassDeclaration(n)||ts.isClassExpression(n)){ const s=new Set(); scopeStack.push(s); if(n.name) s.add(n.name.text); ts.forEachChild(n, visit); scopeStack.pop(); return; }
    if(ts.isCatchClause(n)){ const s=new Set(); scopeStack.push(s); if(n.variableDeclaration) bindingNames(n.variableDeclaration.name, s); visit(n.block); scopeStack.pop(); return; }
    if(ts.isIdentifier(n)){ if(!skipIdent(n) && !has(n.text)) free.add(n.text); return; }
    ts.forEachChild(n, visit);
  }
  visit(node); return free;
}
const nodes=[]; const byName=new Map();
sf.statements.forEach((st)=>{
  const names=new Set();
  if((ts.isFunctionDeclaration(st)||ts.isClassDeclaration(st)) && st.name) names.add(st.name.text);
  else if(ts.isVariableStatement(st)) for(const d of st.declarationList.declarations) bindingNames(d.name, names);
  const kind=ts.SyntaxKind[st.kind];
  const node={names:[...names], start:st.pos, end:st.end, bytes:st.end-st.pos, deps:freeIdents(st), side:!names.size && kind!=="ExportDeclaration"};
  nodes.push(node); for(const n of names){ if(!byName.has(n)) byName.set(n,[]); byName.get(n).push(node);} 
});
const seen=new Set(); const q=[];
function add(n){ if(n && !seen.has(n)){ seen.add(n); q.push(n);} }
add(nodes.find(n=>n.names.includes("App")));
const runtime = new Set(["react","react_production_min","jsxRuntime","reactJsxRuntime_production_min","scheduler","scheduler_production_min","reactDom","reactDom_production_min"]);
while(q.length){
  const n=q.pop();
  for(const d of n.deps){
    if(pages.has(d)) continue;
    const t=byName.get(d); if(!t) continue;
    for(const x of t) add(x);
  }
}
// add side statements that touch runtime bindings
let added=0;
for(const n of nodes){
  if(!n.side || seen.has(n)) continue;
  if([...n.deps].some(d=>runtime.has(d))) { add(n); added++; }
}
while(q.length){
  const n=q.pop();
  for(const d of n.deps){
    if(pages.has(d)) continue;
    const t=byName.get(d); if(!t) continue;
    for(const x of t) add(x);
  }
}
const parts=[...seen].sort((a,b)=>a.start-b.start).map(n=>source.slice(n.start,n.end));
const raw=parts.join("\n");
console.log("added side", added, "nodes", seen.size, "raw", raw.length, "gz", gzipSync(Buffer.from(raw)).length);
