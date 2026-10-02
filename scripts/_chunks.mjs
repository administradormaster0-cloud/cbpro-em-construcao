import { readFileSync } from "fs";
const files = ["FantasyDashboard-DvlT5jzs.krq7kq.js","html2canvas.esm-CBrSDip1.14wcuf8.js","stripe.bnd1ic.js","AvatarViewport-7s0OPQYE.sy2twr.js"];
for (const f of files) {
  const s = readFileSync("D:/FC CLUBS/site/js/"+f,"utf8");
  console.log("\n", f, s.length);
  const m = s.match(/from"\.\/[^"]+"/g);
  console.log("imports", m && m.slice(0,8));
  console.log("head", s.slice(0,150));
}
