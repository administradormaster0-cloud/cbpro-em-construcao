import ts from "typescript";
import { readFileSync } from "fs";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
function bindingNames(node, out){ if(!node) return; if(ts.isIdentifier(node)) out.add(node.text); else if(ts.isObjectBindingPattern(node)||ts.isArrayBindingPattern(node)) for(const el of node.elements) if(ts.isBindingElement(el)) bindingNames(el.name, out); }
function skipIdent(n){
  const parent=n.parent; if(!parent) return false;
  if(ts.isPropertyAccessExpression(parent) && parent.name===n) return true;
  if(ts.isPropertyAssignment(parent) && parent.name===n) return true;
  if(ts.isBindingElement(parent) && parent.propertyName===n) return true;
  function descendant(node, id){ if(!node) return false; if(node===id) return true; let f=false; function w(x){ if(x===id) f=true; else ts.forEachChild(x,w);} w(node); return f; }
  if(ts.isVariableDeclaration(parent) && parent.name && descendant(parent.name, n) && !(parent.initializer && descendant(parent.initializer, n))) return true;
  if(ts.isParameter(parent) && parent.name && descendant(parent.name, n)) return true;
  if(ts.isBindingElement(parent) && parent.name && descendant(parent.name, n)) return true;
  return false;
}
function freeIdents(node){
  const scopeStack=[new Set()]; const free=new Set();
  function has(name){ for(let i=scopeStack.length-1;i>=0;i--) if(scopeStack[i].has(name)) return true; return false; }
  function collectLocal(body, s){ function walk(n){ if(n!==body && (ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isClassDeclaration(n)||ts.isClassExpression(n))) return; if(ts.isVariableDeclaration(n)) bindingNames(n.name, s); if((ts.isFunctionDeclaration(n)||ts.isClassDeclaration(n)) && n.name) s.add(n.name.text); ts.forEachChild(n, walk);} walk(body); }
  function visit(n){
    if(ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isMethodDeclaration(n)||ts.isConstructorDeclaration(n)||ts.isGetAccessorDeclaration(n)||ts.isSetAccessorDeclaration(n)){
      const s=new Set(); scopeStack.push(s); for(const p of n.parameters) bindingNames(p.name, s); if(n.body) collectLocal(n.body, s); ts.forEachChild(n, c=>{ if(c!==n.name) visit(c); }); scopeStack.pop(); return;
    }
    if(ts.isIdentifier(n)){ if(!skipIdent(n) && !has(n.text)) free.add(n.text); return; }
    ts.forEachChild(n, visit);
  }
  visit(node); return free;
}
for (const st of sf.statements) {
  const deps = freeIdents(st);
  if (deps.has("OrgEloRanking")) {
    const names=[];
    if (st.name) names.push(st.name.text);
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) names.push(d.name.text);
    console.log(names.slice(0,4).join(","), "bytes", st.end-st.pos, source.slice(st.getStart(sf), st.getStart(sf)+80).replaceAll("\n"," "));
  }
}
