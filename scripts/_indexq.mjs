import ts from "typescript";
import { readFileSync } from "fs";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
const sf = ts.createSourceFile("index.js", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const want = new Set(["Index","RankedPublic","RecruitmentPublic","TeamPublic","fetchLeaderboard"]);
for (const st of sf.statements) {
  if (ts.isFunctionDeclaration(st) && st.name && want.has(st.name.text)) {
    const text = source.slice(st.getStart(sf), st.end);
    console.log("\n####", st.name.text, "bytes", text.length);
    const re = /\.from\("([^"]+)"\)[^;]{0,180}/g;
    let m, n=0;
    while ((m = re.exec(text)) && n < 12) { console.log(m[0].slice(0,200)); n++; }
  }
}
