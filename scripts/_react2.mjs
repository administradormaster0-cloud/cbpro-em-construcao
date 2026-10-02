import ts from "typescript";
import { readFileSync } from "fs";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
let n=0;
for (const st of sf.statements) {
  if (!ts.isVariableStatement(st)) continue;
  for (const d of st.declarationList.declarations) {
    if (ts.isIdentifier(d.name) && (d.name.text==="react" || d.name.text==="jsxRuntime" || d.name.text==="React")) {
      console.log("decl", d.name.text, "bytes", st.end-st.pos);
      console.log(source.slice(st.pos, Math.min(st.end, st.pos+250)).replaceAll("\n"," "));
      console.log("TAIL", source.slice(Math.max(st.pos, st.end-200), st.end).replaceAll("\n"," "));
      n++;
    }
  }
}
console.log("found", n);
