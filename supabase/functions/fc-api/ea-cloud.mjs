import {normalizeClubs} from './ea-clubs.mjs';
export async function searchEaCloud(name,request){const query=String(name||'').trim();if(query.length<2||query.length>40)throw Object.assign(Error('Informe de 2 a 40 caracteres.'),{status:400});const platforms=['common-gen5','common-gen4','nx'];
 const responses=await Promise.allSettled(platforms.map(p=>request('fc_ea_search',{p_name:query,p_platform:p})));let success=0;const unique=new Map();
 for(let i=0;i<responses.length;i++){const r=responses[i];if(r.status!=='fulfilled'||r.value.status!==200)continue;success++;for(const club of normalizeClubs(r.value.data,platforms[i]))unique.set(club.platform+':'+club.clubId,club);}
 if(!success)throw Object.assign(Error('A EA está temporariamente indisponível. Tente novamente.'),{status:503});return {results:[...unique.values()].slice(0,30)};
}
