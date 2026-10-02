import ts from "typescript";
import { readFileSync } from "fs";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
function bindingNames(node, out){ if(!node) return; if(ts.isIdentifier(node)) out.add(node.text); else if(ts.isObjectBindingPattern(node)||ts.isArrayBindingPattern(node)) for(const el of node.elements) if(ts.isBindingElement(el)) bindingNames(el.name, out); }
const nodes=[];
sf.statements.forEach((st)=>{
  const names=new Set();
  if((ts.isFunctionDeclaration(st)||ts.isClassDeclaration(st)) && st.name) names.add(st.name.text);
  else if(ts.isVariableStatement(st)) for(const d of st.declarationList.declarations) bindingNames(d.name, names);
  if (names.has("reactExports") || names.has("jsxRuntimeExports") || names.has("useState")) {
    console.log("KIND", ts.SyntaxKind[st.kind], "bytes", st.end-st.pos, "names", [...names].slice(0,12).join(","));
    console.log(source.slice(st.pos, st.pos+180).replaceAll("\n"," "));
    console.log("---");
  }
});
