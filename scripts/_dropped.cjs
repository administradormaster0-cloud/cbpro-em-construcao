const fs = require("fs");
const ts = require("D:/FC CLUBS/fcclubs/node_modules/typescript");
const source = fs.readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const entry = fs.readFileSync("D:/FC CLUBS/fcclubs/data/hostinger-release/js/index-ef287076.js","utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS);
let n = 0;
for (const st of sf.statements) {
  if (st.kind === ts.SyntaxKind.FunctionDeclaration || st.kind === ts.SyntaxKind.ClassDeclaration || st.kind === ts.SyntaxKind.VariableStatement || st.kind === ts.SyntaxKind.ExportDeclaration) continue;
  const text = source.slice(st.pos, st.end).trim();
  if (!text || entry.includes(text.slice(0, 80))) continue;
  if (n < 25) console.log(st.end-st.pos, text.slice(0, 140).replaceAll("\n"," "));
  n++;
}
console.log("dropped side statements", n);
