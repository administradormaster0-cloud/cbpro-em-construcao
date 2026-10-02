const fs = require("fs");
const zlib = require("zlib");
const ts = require("D:/FC CLUBS/fcclubs/node_modules/typescript");
const source = fs.readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const entryPath = "D:/FC CLUBS/fcclubs/data/hostinger-release/js/index-ef287076.js";
let entry = fs.readFileSync(entryPath,"utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
function bindingNames(node, out){ if(!node) return; if(ts.isIdentifier(node)) out.add(node.text); else if(ts.isObjectBindingPattern(node)||ts.isArrayBindingPattern(node)) for (const el of node.elements) if (ts.isBindingElement(el)) bindingNames(el.name, out); }
function descendant(node, id){ if(!node) return false; if(node===id) return true; let f=false; function w(x){ if(x===id) f=true; else ts.forEachChild(x,w);} w(node); return f; }
function skipIdent(n){ const parent=n.parent; if(!parent) return false; if(ts.isPropertyAccessExpression(parent)&&parent.name===n) return true; if(ts.isPropertyAssignment(parent)&&parent.name===n) return true; if(ts.isBindingElement(parent)&&parent.propertyName===n) return true; if(ts.isVariableDeclaration(parent)&&parent.name&&descendant(parent.name,n)&&!(parent.initializer&&descendant(parent.initializer,n))) return true; if(ts.isParameter(parent)&&parent.name&&descendant(parent.name,n)) return true; if(ts.isBindingElement(parent)&&parent.name&&descendant(parent.name,n)) return true; return false; }
function freeIdents(node){ const scopeStack=[new Set()]; const free=new Set(); function has(name){ for(let i=scopeStack.length-1;i>=0;i--) if(scopeStack[i].has(name)) return true; return false;} function collectLocal(body,s){ function walk(n){ if(n!==body && (ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isClassDeclaration(n)||ts.isClassExpression(n))) return; if(ts.isVariableDeclaration(n)) bindingNames(n.name,s); if((ts.isFunctionDeclaration(n)||ts.isClassDeclaration(n))&&n.name) s.add(n.name.text); ts.forEachChild(n,walk);} walk(body);} function visit(n){ if(ts.isFunctionDeclaration(n)||ts.isFunctionExpression(n)||ts.isArrowFunction(n)||ts.isMethodDeclaration(n)||ts.isConstructorDeclaration(n)){ const s=new Set(); scopeStack.push(s); for(const p of n.parameters) bindingNames(p.name,s); if(n.body) collectLocal(n.body,s); ts.forEachChild(n,c=>{ if(c!==n.name) visit(c); }); scopeStack.pop(); return;} if(ts.isIdentifier(n)){ if(!skipIdent(n)&&!has(n.text)) free.add(n.text); return;} ts.forEachChild(n,visit);} visit(node); return free; }
const byName=new Set();
sf.statements.forEach(st=>{ if((ts.isFunctionDeclaration(st)||ts.isClassDeclaration(st))&&st.name) byName.add(st.name.text); else if(ts.isVariableStatement(st)) for(const d of st.declarationList.declarations) bindingNames(d.name, byName); });
// names present in entry: crude, all identifiers that are declarations we kept. Use byName intersect a regex of declaration in entry is hard.
// Treat a binding as available if its declaration text start is included in entry.
const available=new Set();
for (const st of sf.statements) {
  const text=source.slice(st.pos, Math.min(st.end, st.pos+120));
  if (text.trim() && entry.includes(text.trim().slice(0,80))) {
    if((ts.isFunctionDeclaration(st)||ts.isClassDeclaration(st))&&st.name) available.add(st.name.text);
    else if(ts.isVariableStatement(st)) for(const d of st.declarationList.declarations) bindingNames(d.name, available);
  }
}
const extra=[];
for (const st of sf.statements) {
  if (st.kind===ts.SyntaxKind.FunctionDeclaration||st.kind===ts.SyntaxKind.ClassDeclaration||st.kind===ts.SyntaxKind.VariableStatement||st.kind===ts.SyntaxKind.ExportDeclaration) continue;
  const text=source.slice(st.pos, st.end);
  if (entry.includes(text.slice(0,80))) continue;
  const deps=freeIdents(st);
  let bad=false;
  for (const d of deps) if (byName.has(d) && !available.has(d)) bad=true;
  if (!bad) extra.push(text);
}
const blob=extra.join("\n");
console.log("extra statements", extra.length, "raw", blob.length, "gz", zlib.gzipSync(Buffer.from(entry+"\n"+blob)).length, "old", zlib.gzipSync(Buffer.from(entry)).length);
