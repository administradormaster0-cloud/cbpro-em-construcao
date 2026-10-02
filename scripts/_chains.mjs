import ts from "typescript";
import { readFileSync } from "fs";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const pages = new Set("AuthRoute SignupWizard Onboarding ResetPassword Index PlayerPublic TeamPublic TournamentsPublic PlayersPublic TeamsPublic OrgsPublic OrganizationRequest FederationPublic TournamentPublic BlogPostPublic RegulationsPublic PrivacyPolicy DeleteAccount MarketplaceHub TransfersPublic RecruitmentPublic ChampionsPublic CreditsPurchaseSuccess StripeCheckoutPage StripeConnectReturn CreditsPurchaseCanceled RankedPublic FantasyPublic FantasyMarketPublic FantasyLeaguePublic RnkPlayersPublic SlugPublic ProtectedRoute Dashboard Games GameDetail Profiles Teams Invites Tournaments TournamentDetail MyCollection DraftArena DraftCreate DraftDetail TorneioFacil TorneioFacilCreate Friendlies RankedLeaderboard FantasyHub FantasyLeagueDetail OrgManage MyOrgs SocialMedia AdminRoute NotFound Login AppLayout AdminPanel".split(" "));
function bindingNames(node, out){ if(!node) return; if(ts.isIdentifier(node)) out.add(node.text); else if(ts.isObjectBindingPattern(node)||ts.isArrayBindingPattern(node)) for(const el of node.elements) if(ts.isBindingElement(el)) bindingNames(el.name, out); }
function freeIdents(node){
  const scopeStack=[new Set()]; const free=new Set();
  function has(name){ for(let i=scopeStack.length-1;i>=0;i--) if(scopeStack[i].has(name)) return true; return false; }
  function nameNodeHas(nameNode, id){ if(!nameNode) return false; if(nameNode===id) return true; let found=false; function w(x){ if(x===id) found=true; else ts.forEachChild(x,w);} w(nameNode); return found; }
  function collectLocal(body, s){ function walk(n){ if(n!==body && (ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isClassDeclaration(n)||ts.isClassExpression(n))) return; if(ts.isVariableDeclaration(n)) bindingNames(n.name, s); if((ts.isFunctionDeclaration(n)||ts.isClassDeclaration(n)) && n.name) s.add(n.name.text); ts.forEachChild(n, walk);} walk(body); }
  function visit(n){
    if(ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isMethodDeclaration(n)||ts.isConstructorDeclaration(n)||ts.isGetAccessorDeclaration(n)||ts.isSetAccessorDeclaration(n)){
      const s=new Set(); scopeStack.push(s); for(const p of n.parameters) bindingNames(p.name, s); if(n.body) collectLocal(n.body, s); ts.forEachChild(n, c=>{ if(c!==n.name) visit(c); }); scopeStack.pop(); return;
    }
    if(ts.isClassDeclaration(n)||ts.isClassExpression(n)){ const s=new Set(); scopeStack.push(s); if(n.name) s.add(n.name.text); ts.forEachChild(n, visit); scopeStack.pop(); return; }
    if(ts.isIdentifier(n)){
      const parent=n.parent;
      if(parent && ts.isPropertyAccessExpression(parent) && parent.name===n) return;
      if(parent && ts.isPropertyAssignment(parent) && parent.name===n) return;
      if(parent && ts.isVariableDeclaration(parent) && nameNodeHas(parent.name, n)) return;
      if(parent && ts.isBindingElement(parent) && nameNodeHas(parent.name, n)) return;
      if(parent && ts.isParameter(parent) && nameNodeHas(parent.name, n)) return;
      if(!has(n.text)) free.add(n.text); return;
    }
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
function chain(targetName){
  const target=nodes.find(n=>n.names.includes(targetName));
  const parent=new Map(); const seen=new Set(); const q=[];
  const app=nodes.find(n=>n.names.includes("App"));
  q.push(app); seen.add(app);
  while(q.length){ const n=q.shift(); if(n===target) break; for(const d of n.deps){ if(pages.has(d)) continue; const t=byName.get(d); if(!t) continue; for(const x of t) if(!seen.has(x)){ seen.add(x); parent.set(x,{via:d,from:n}); q.push(x);} } }
  let cur=target; const lines=[];
  while(cur){ const p=parent.get(cur); lines.push((cur.names[0]||"?")+" <= "+(p?p.via:"SEED")+" ("+cur.bytes+") "+source.slice(cur.start, cur.start+70).replaceAll("\n"," ")); cur=p&&p.from; if(lines.length>15) break; }
  console.log("\n==", targetName, "reached", seen.has(target));
  console.log(lines.join("\n"));
}
chain("fc");
chain("ft");
chain("style");
chain("mc");
