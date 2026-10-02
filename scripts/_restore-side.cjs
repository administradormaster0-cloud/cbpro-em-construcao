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
const declared=new Map();
sf.statements.forEach(st=>{ const names=new Set(); if((ts.isFunctionDeclaration(st)||ts.isClassDeclaration(st))&&st.name) names.add(st.name.text); else if(ts.isVariableStatement(st)) for(const d of st.declarationList.declarations) bindingNames(d.name, names); for (const n of names) declared.set(n, st); });
const available=new Set();
for (const [name, st] of declared) {
  const sig = name.length>3 ? name : source.slice(st.pos, Math.min(st.end, st.pos+90)).trim();
  if (entry.includes(sig)) available.add(name);
}
const extra=[];
for (const st of sf.statements) {
  if ([ts.SyntaxKind.FunctionDeclaration,ts.SyntaxKind.ClassDeclaration,ts.SyntaxKind.VariableStatement,ts.SyntaxKind.ExportDeclaration].includes(st.kind)) continue;
  const text=source.slice(st.pos, st.end);
  if (entry.includes(text.slice(0, Math.min(80, text.length)))) continue;
  const deps=[...freeIdents(st)].filter(d=>declared.has(d));
  if (deps.every(d=>available.has(d))) extra.push(text);
}
const marker="createRoot(document.getElementById";
const at=entry.indexOf(marker);
if(at<0) throw new Error("no root");
entry=entry.slice(0,at)+extra.join("\n")+"\n"+entry.slice(at);
fs.writeFileSync(entryPath, entry);
const pub="D:/FC CLUBS/fcclubs/data/public-js/index-ef287076.js";
if (fs.existsSync(pub)) fs.writeFileSync(pub, entry);
console.log(JSON.stringify({added:extra.length, raw:entry.length, gz:zlib.gzipSync(Buffer.from(entry)).length}));
