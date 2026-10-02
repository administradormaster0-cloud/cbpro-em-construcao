const fs = require("fs");
const s = fs.readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js","utf8");
for (const k of ["ranked_profiles", "recruitment_ads"]) {
  let i = 0, n = 0;
  while ((i = s.indexOf(k, i)) !== -1 && n < 6) {
    console.log("\n==", k, i, "==");
    console.log(s.slice(Math.max(0,i-120), i+220));
    i += k.length; n++;
  }
}
