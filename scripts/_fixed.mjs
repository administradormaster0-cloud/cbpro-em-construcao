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
  if(ts.isShorthandPropertyAssignment(parent) && parent.name===n) return false;
  if((ts.isFunctionDeclaration(parent)||ts.isClassDeclaration(parent)||ts.isFunctionExpression(parent)||ts.isClassExpression(parent)) && parent.name===n) return true;
  if(ts.isVariableDeclaration(parent) && parent.name && descendant(parent.name, n) && !descendantInit(parent, n)) return true;
  if(ts.isParameter(parent) && parent.name && descendant(parent.name, n)) return true;
  if(ts.isBindingElement(parent) && parent.name && descendant(parent.name, n)) return true;
  return false;
}
function descendant(node, id){ if(node===id) return true; let f=false; function w(x){ if(x===id) f=true; else ts.forEachChild(x,w);} if(node) w(node); return f; }
function descendantInit(parent, n){ return parent.initializer && descendant(parent.initializer, n); }
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
  const node={names:[...names], start:st.pos, end:st.end, bytes:st.end-st.pos, deps:freeIdents(st)};
  nodes.push(node); for(const n of names){ if(!byName.has(n)) byName.set(n,[]); byName.get(n).push(node);} 
});
function closure(extraBlock){
  const seen=new Set(); const q=[nodes.find(n=>n.names.includes("App"))];
  while(q.length){ const n=q.pop(); if(seen.has(n)) continue; seen.add(n); for(const d of n.deps){ if(pages.has(d)||extraBlock.has(d)) continue; const t=byName.get(d); if(!t) continue; for(const x of t) if(!seen.has(x)) q.push(x);} }
  const parts=[...seen].sort((a,b)=>a.start-b.start).map(n=>source.slice(n.start,n.end));
  const raw=parts.join("\n");
  return {count:seen.size, raw:raw.length, gz:gzipSync(Buffer.from(raw)).length, seen};
}
const shell=closure(new Set());
console.log("shell", shell.count, shell.raw, shell.gz);
const big=[...shell.seen].filter(n=>n.bytes>12000).sort((a,b)=>b.bytes-a.bytes);
for (const n of big) console.log(n.bytes, gzipSync(Buffer.from(source.slice(n.start,n.end))).length, n.names.slice(0,3).join(","), source.slice(n.start, n.start+60).replaceAll("\n"," "));
const xlsx = nodes.filter(n => source.slice(n.start, n.end).includes("sheet_to_json") || source.slice(n.start, Math.min(n.end, n.start+30)).includes("xlsx"));
console.log("xlsx nodes in shell", xlsx.filter(n=>shell.seen.has(n)).length, "of", xlsx.length);
