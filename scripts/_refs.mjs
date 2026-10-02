import ts from "typescript";
import { readFileSync } from "fs";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
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
  const text=source.slice(st.pos, st.end);
  const node={names:[...names], bytes:st.end-st.pos, deps:freeIdents(st), text};
  nodes.push(node); for(const n of names){ if(!byName.has(n)) byName.set(n,[]); byName.get(n).push(node);} 
});
const heavyHeads = ["ONNX Runtime", "xlsx.js", "const style={circle:", "const notReadyT="];
const heavy = new Set(nodes.filter(n => heavyHeads.some(h => n.text.includes(h))));
console.log("heavy nodes", heavy.size, "bytes", [...heavy].reduce((s,n)=>s+n.bytes,0));
const targets = new Set();
for (const n of heavy) for (const name of n.names) targets.add(name);
const refs = [];
for (const n of nodes) {
  if (heavy.has(n)) continue;
  const hit = [...n.deps].filter(d => targets.has(d));
  if (hit.length) refs.push({bytes:n.bytes, names:n.names.slice(0,4), hit:hit.slice(0,8), head:n.text.slice(0,80).replaceAll("\n"," ")});
}
refs.sort((a,b)=>b.bytes-a.bytes);
console.log("referrers", refs.length);
for (const r of refs.slice(0,40)) console.log(r.bytes, r.names.join("|"), "->", r.hit.join(","), r.head);
