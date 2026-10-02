const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js", "utf8");
const keys = ["sheet_to_json","sheet_to_csv","XLSX","readFile","book_new","aoa_to_sheet","decode_range"];
for (const k of keys) {
  let c=0,i=0,first=-1;
  while ((i=s.indexOf(k,i))!==-1) { if(first<0) first=i; c++; i+=k.length; if(c>50) break; }
  console.log(k, c, first);
}
