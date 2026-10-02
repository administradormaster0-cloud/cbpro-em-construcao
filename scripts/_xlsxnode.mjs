import ts from "typescript";
import { readFileSync } from "fs";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const at = source.indexOf("/*! xlsx.js");
let found=null;
for (const st of sf.statements) {
  if (st.getStart(sf) <= at && st.end > at) {
    const names=[];
    if (st.name) names.push(st.name.text);
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) names.push(d.name.text);
    found={kind:ts.SyntaxKind[st.kind], start:st.getStart(sf), end:st.end, bytes:st.end-st.getStart(sf), names:names.slice(0,20), head:source.slice(st.getStart(sf), st.getStart(sf)+100)};
    break;
  }
}
console.log(found);
const app = sf.statements.find(st => ts.isVariableStatement(st) && st.declarationList.declarations.some(d => ts.isIdentifier(d.name) && d.name.text==="App"));
console.log("App deps snippet", source.slice(app.getStart(sf), app.getStart(sf)+500));
