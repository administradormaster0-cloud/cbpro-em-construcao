
const {} = globalThis;
function formatDateOnly(i,o="pt-BR"){if(!i)return"—";const et=i instanceof Date?i.toISOString():String(i),st=et.includes("T")?et.split("T")[0]:et.slice(0,10),[at,vt,Ct]=st.split("-").map(Number);return!at||!vt||!Ct?"—":new Intl.DateTimeFormat(o,{timeZone:"UTC",day:"2-digit",month:"2-digit",year:"numeric"}).format(new Date(Date.UTC(at,vt-1,Ct)))}
export {formatDateOnly};
