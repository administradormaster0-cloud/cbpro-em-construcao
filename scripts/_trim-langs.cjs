const fs = require("fs");
const zlib = require("zlib");
const { createHash } = require("crypto");
const path = require("path");
const dir = "D:/FC CLUBS/fcclubs/data/public-js";
const oldName = "index-0b7cc5a8.js";
let s = fs.readFileSync(path.join(dir, oldName), "utf8");
const start = s.indexOf(",en$2=");
const end = s.indexOf(",supportedLanguages=");
if (start < 0 || end < 0 || end < start) throw new Error("bounds");
const dict = s.slice(start + 1, end);
const esAt = dict.indexOf(",es$3=");
if (esAt < 0) throw new Error("es");
const enObj = dict.slice("en$2=".length, esAt);
const esObj = dict.slice(esAt + ",es$3=".length);
const langs = `export const en = ${enObj};\nexport const es = ${esObj};\n`;
const langHash = createHash("sha256").update(langs).digest("hex").slice(0, 8);
const langFile = `langs-${langHash}.js`;
fs.writeFileSync(path.join(dir, langFile), langs);
s = s.slice(0, start) + ",en$2={},es$3={}" + s.slice(end);
s = s.replace(
  'resources:{"pt-BR":{translation:ptBR$1},en:{translation:en$2},es:{translation:es$3}}',
  'resources:{"pt-BR":{translation:ptBR$1}}'
);
const loader = `let __langPack;function __ensureLangs(){if(!__langPack)__langPack=import("./${langFile}").then(m=>{instance.addResourceBundle("en","translation",m.en);instance.addResourceBundle("es","translation",m.es);});return __langPack}`;
if (!s.includes("async function changeLanguage(i,o){")) throw new Error("changeLanguage missing");
s = s.replace("async function changeLanguage(i,o){", loader + ";async function changeLanguage(i,o){await __ensureLangs();");
if (s.includes("initialLanguage!==\"pt-BR\"")) throw new Error("already");
s = s.replace("interpolation:{escapeValue:!1}});", "interpolation:{escapeValue:!1}});if(initialLanguage!==\"pt-BR\")__ensureLangs().then(()=>instance.changeLanguage(initialLanguage));");
const entryHash = createHash("sha256").update(s).digest("hex").slice(0, 8);
const entryFile = `index-${entryHash}.js`;
fs.writeFileSync(path.join(dir, entryFile), s);
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".js") || file === entryFile || file === langFile) continue;
  const p = path.join(dir, file);
  const text = fs.readFileSync(p, "utf8");
  if (text.includes(oldName)) fs.writeFileSync(p, text.replaceAll(oldName, entryFile));
}
fs.unlinkSync(path.join(dir, oldName));
console.log(JSON.stringify({
  entry: entryFile,
  raw: s.length,
  gz: zlib.gzipSync(Buffer.from(s)).length,
  langs: langFile,
  langsRaw: langs.length,
  langsGz: zlib.gzipSync(Buffer.from(langs)).length
}));
