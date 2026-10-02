
const {} = globalThis;
function groupByCategory(i){const o=new Map;for(const et of i)o.has(et.category)||o.set(et.category,[]),o.get(et.category).push(et);return Array.from(o.entries()).map(([et,st])=>({category:et,features:st}))}
export {groupByCategory};
