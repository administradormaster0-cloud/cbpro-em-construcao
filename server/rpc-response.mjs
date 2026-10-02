// PostgREST applies range/limit to set-returning RPCs as it does to tables.
export function paginateRpc(data,query,rangeHeader){
 if(!Array.isArray(data))return {data,headers:{}};
 const range=rangeHeader?.match(/^(\d+)-(\d+)$/),offset=range?Number(range[1]):Number(query.get('offset')||0),limit=range?Number(range[2])-offset+1:Number(query.get('limit')||1000);
 if(!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(limit)||limit<0)throw Object.assign(new Error('Intervalo de paginação inválido.'),{status:400});
 const rows=data.slice(offset,offset+Math.min(limit,10000));
 return {data:rows,headers:{'Content-Range':rows.length?`${offset}-${offset+rows.length-1}/${data.length}`:`*/${data.length}`,'Access-Control-Expose-Headers':'Content-Range'}};
}
