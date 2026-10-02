import ts from "typescript";
import { readFileSync } from "fs";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js", "utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
console.log("statements", sf.statements.length, "diags", sf.parseDiagnostics.length);
const kinds = {};
for (const st of sf.statements) {
  const k = ts.SyntaxKind[st.kind];
  kinds[k] = (kinds[k] || 0) + 1;
}
console.log(kinds);
let fn = 0;
for (const st of sf.statements) {
  if (ts.isFunctionDeclaration(st) && st.name) fn++;
}
console.log("named function decls", fn);
