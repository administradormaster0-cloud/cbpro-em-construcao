import ts from "typescript";
import { readFileSync } from "fs";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const at = source.indexOf("/*! xlsx.js");
console.log("at", at, "stmts", sf.statements.length, "sf.end", sf.end);
let prev=null;
for (const st of sf.statements) {
  const a=st.pos, b=st.end;
  if (a<=at && b>at) { console.log("HIT", ts.SyntaxKind[st.kind], a, b, b-a); break; }
  if (a>at) { console.log("PREV", prev && ts.SyntaxKind[prev.kind], prev && prev.pos, prev && prev.end); console.log("NEXT", ts.SyntaxKind[st.kind], a, b); break; }
  prev=st;
}
