import ts from "typescript";
import { readFileSync } from "fs";
import { gzipSync } from "zlib";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const pages = new Set("AuthRoute SignupWizard Onboarding ResetPassword Index PlayerPublic TeamPublic TournamentsPublic PlayersPublic TeamsPublic OrgsPublic OrganizationRequest FederationPublic TournamentPublic BlogPostPublic RegulationsPublic PrivacyPolicy DeleteAccount MarketplaceHub TransfersPublic RecruitmentPublic ChampionsPublic CreditsPurchaseSuccess StripeCheckoutPage StripeConnectReturn CreditsPurchaseCanceled RankedPublic FantasyPublic FantasyMarketPublic FantasyLeaguePublic RnkPlayersPublic SlugPublic ProtectedRoute Dashboard Games GameDetail Profiles Teams Invites Tournaments TournamentDetail MyCollection DraftArena DraftCreate DraftDetail TorneioFacil TorneioFacilCreate Friendlies RankedLeaderboard FantasyHub FantasyLeagueDetail OrgManage MyOrgs SocialMedia AdminRoute NotFound Login AppLayout AdminPanel".split(" "));
function bindingNames(node, out){
  if(!node) return;
  if(ts.isIdentifier(node)) out.add(node.text);
  else if(ts.isObjectBindingPattern(node)||ts.isArrayBindingPattern(node)) for(const el of node.elements) if(ts.isBindingElement(el)) bindingNames(el.name, out);
  else if(ts.isVariableDeclaration(node)) bindingNames(node.name, out);
}
function freeIdents(node){
  const scopeStack=[new Set()];
  const free=new Set();
  function has(name){ for(let i=scopeStack.length-1;i>=0;i--) if(scopeStack[i].has(name)) return true; return false; }
  function nameNodeHas(nameNode, id){ if(!nameNode) return false; if(nameNode===id) return true; let found=false; function w(x){ if(x===id) found=true; else ts.forEachChild(x,w);} w(nameNode); return found; }
  function collectLocal(body, s){
    function walk(n){
      if(n!==body && (ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isClassDeclaration(n)||ts.isClassExpression(n))) return;
      if(ts.isVariableDeclaration(n)) bindingNames(n.name, s);
      if((ts.isFunctionDeclaration(n)||ts.isClassDeclaration(n)) && n.name) s.add(n.name.text);
      ts.forEachChild(n, walk);
    }
    walk(body);
  }
  function visit(n){
    if(ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isMethodDeclaration(n)||ts.isConstructorDeclaration(n)||ts.isGetAccessorDeclaration(n)||ts.isSetAccessorDeclaration(n)){
      const s=new Set(); scopeStack.push(s);
      for(const p of n.parameters) bindingNames(p.name, s);
      if(n.body) collectLocal(n.body, s);
      ts.forEachChild(n, c => { if(c!==n.name) visit(c); });
      scopeStack.pop(); return;
    }
    if(ts.isClassDeclaration(n)||ts.isClassExpression(n)){
      const s=new Set(); scopeStack.push(s); if(n.name) s.add(n.name.text); ts.forEachChild(n, visit); scopeStack.pop(); return;
    }
    if(ts.isIdentifier(n)){
      const parent=n.parent;
      if(parent && ts.isPropertyAccessExpression(parent) && parent.name===n) return;
      if(parent && ts.isPropertyAssignment(parent) && parent.name===n) return;
      if(parent && (ts.isFunctionDeclaration(parent)||ts.isClassDeclaration(parent)||ts.isFunctionExpression(parent)||ts.isClassExpression(parent)) && parent.name===n) return;
      if(parent && ts.isVariableDeclaration(parent) && nameNodeHas(parent.name, n)) return;
      if(parent && ts.isBindingElement(parent) && nameNodeHas(parent.name, n)) return;
      if(parent && ts.isParameter(parent) && nameNodeHas(parent.name, n)) return;
      if(!has(n.text)) free.add(n.text);
      return;
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
  const node={names:[...names], start:st.getStart(sf), end:st.end, bytes:st.end-st.getStart(sf), deps:freeIdents(st), kind:ts.SyntaxKind[st.kind]};
  nodes.push(node);
  for(const n of names){ if(!byName.has(n)) byName.set(n,[]); byName.get(n).push(node); }
});
function closure(seeds, block){
  const seen=new Set(); const q=[];
  for(const n of nodes) for(const name of n.names) if(seeds.has(name)) q.push(n);
  while(q.length){
    const n=q.pop(); if(seen.has(n)) continue; seen.add(n);
    for(const d of n.deps){
      if(block.has(d)) continue;
      const ts=byName.get(d); if(!ts) continue;
      for(const t of ts) if(!seen.has(t)) q.push(t);
    }
  }
  let bytes=0; const parts=[];
  const ordered=[...seen].sort((a,b)=>a.start-b.start);
  for(const n of ordered){ bytes+=n.bytes; parts.push(source.slice(n.start,n.end)); }
  const gz=gzipSync(Buffer.from(parts.join("\n"))).length;
  return {count:seen.size, bytes, gz};
}
const blockPages=new Set(pages);
const shell=closure(new Set(["App"]), blockPages);
console.log("shell without pages", shell);
const indexOnlyBlock=new Set(pages); indexOnlyBlock.delete("Index");
const withIndex=closure(new Set(["App","Index"]), indexOnlyBlock);
console.log("shell+Index", withIndex);
const idx=closure(new Set(["Index"]), new Set());
console.log("Index full closure", idx);
function containsXlsx(setName, seeds, block){
  const seen=new Set(); const q=[];
  for(const n of nodes) for(const name of n.names) if(seeds.has(name)) q.push(n);
  while(q.length){ const n=q.pop(); if(seen.has(n)) continue; seen.add(n); for(const d of n.deps){ if(block.has(d)) continue; const t=byName.get(d); if(!t) continue; for(const x of t) if(!seen.has(x)) q.push(x);} }
  let hit=false; for(const n of seen) if(source.slice(n.start, Math.min(n.end, n.start+80)).includes("xlsx.js")) hit=true;
  const xlsxNode=nodes.find(n=>source.slice(n.start, n.start+40).includes("xlsx.js") || source.slice(n.start, n.end).includes("/*! xlsx.js"));
  console.log(setName, "includes xlsx node", xlsxNode? seen.has(xlsxNode): "no node", "xlsx node bytes", xlsxNode&&xlsxNode.bytes);
}
containsXlsx("shell", new Set(["App"]), blockPages);
containsXlsx("index", new Set(["Index"]), new Set());
const heavy=["sheet_to_json","book_new","XLSX"];
for(const h of heavy) console.log("binding", h, byName.has(h), byName.get(h)?.[0]?.bytes);
