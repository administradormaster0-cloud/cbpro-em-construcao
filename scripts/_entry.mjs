import ts from "typescript";
import { readFileSync } from "fs";
const source = readFileSync("D:/FC CLUBS/site/js/index-CL0UsMlE.rw7div.js", "utf8");
const needles = ["createRoot", "createBrowserRouter", "BrowserRouter", "hydrateRoot", "function App(", "function Routes("];
for (const n of needles) {
  let i = 0, c = 0;
  while ((i = source.indexOf(n, i)) !== -1 && c < 3) {
    console.log(n, i, source.slice(i, i + 80).replaceAll("\n"," "));
    i += n.length; c++;
  }
}
