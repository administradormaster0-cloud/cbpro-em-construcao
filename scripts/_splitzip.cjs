const fs = require("fs");
const src = "C:/Users/Mateus/agent-tools/fcclubs-release_20260930_063000.zip";
const size = fs.statSync(src).size;
const chunk = 70 * 1024 * 1024;
const rs = fs.createReadStream(src, { highWaterMark: 1024 * 1024 });
let index = 0, written = 0, current = fs.createWriteStream(src + ".part" + index);
rs.on("data", buf => {
  let off = 0;
  while (off < buf.length) {
    const room = chunk - written;
    const n = Math.min(room, buf.length - off);
    current.write(buf.subarray(off, off + n));
    written += n; off += n;
    if (written >= chunk) { current.end(); index++; written = 0; current = fs.createWriteStream(src + ".part" + index); }
  }
});
rs.on("end", () => { current.end(); console.log("parts", index + (written?1:0), "bytes", size); });
