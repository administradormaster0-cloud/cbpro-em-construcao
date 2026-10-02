
const {} = globalThis;
function formatBillionCoins(i){return i>=1e3?`${(i/1e3).toFixed(1)}T`:i>=1?`${i.toFixed(1)}B`:`${(i*1e3).toFixed(0)}M`}
export {formatBillionCoins};
