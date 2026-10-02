import {clock,stableRandom,isHydration} from './db.mjs';
import { get,save,patch,where,transaction,log,all,db,remove } from './db.mjs';
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
export function transferOwnership(user,teamId,newOwner){
 if(!user)fail('Faça login.',401);
 return transaction(()=>{
  const team=get('teams',teamId);if(!team)fail('Equipe não encontrada.',404);
  if(user.role!=='admin'&&team.owner_user_id!==user.id)fail('Somente o proprietário pode transferir o clube.',403);
  if(!get('users_profile',newOwner))fail('Conta de destino não encontrada.',404);
  if(team.owner_user_id===newOwner)fail('Esta conta já é proprietária.',409);
  const previous=team.owner_user_id;
  patch('teams',teamId,{owner_user_id:newOwner});
  save('team_change_logs',{team_id:teamId,field_name:'owner_user_id',old_value:previous,new_value:newOwner,changed_by_user_id:user.id,created_at:new Date(clock()).toISOString()});
  log(user,'transfer_ownership','teams',teamId);
  return {success:true,team_id:teamId,previous_owner_id:previous,owner_user_id:newOwner};
 });
}
export function reviewOrganization(user,p){
 if(user?.role!=='admin')fail('Acesso administrativo necessário.',403);
 return transaction(()=>{
  const request=get('organization_requests',p.p_request_id);if(!request)fail('Solicitação não encontrada.',404);
  if(request.user_id===user.id)fail('Não é permitido revisar sua própria solicitação.',403);
  if(!['PENDING','pending',undefined,null].includes(request.status))fail('Solicitação já analisada.',409);
  const action=p.p_action;if(!['APPROVE','CREATE','LINK','REJECT'].includes(action))fail('Ação inválida.');
  let federation=null;
  if(action==='LINK'){federation=get('federations',p.p_organization_id);if(!federation)fail('Federação não encontrada.',404);}
  if(action==='CREATE'||action==='APPROVE'){
   const name=String(p.p_name||request.organization_name||'').trim();if(!name)fail('Informe o nome da federação.');
   federation=save('federations',{name,acronym:p.p_acronym||'',country_id:p.p_country_id||request.country_id||null,description:p.p_description||'',logo_url:p.p_logo_url||null,region:p.p_region||'',website:p.p_website||'',instagram:p.p_instagram||'',discord:p.p_discord||'',whatsapp:p.p_whatsapp||'',created_at:new Date(clock()).toISOString()});
  }
  if(federation){const role=p.p_role||'OWNER';if(!['OWNER','ADMIN','MANAGER','STAFF'].includes(role))fail('Função inválida.');const old=where('user_federations','federation_id',federation.id).find(r=>r.user_id===request.user_id);save('user_federations',{...old,user_id:request.user_id,federation_id:federation.id,role,created_at:old?.created_at||new Date(clock()).toISOString()});}
  patch('organization_requests',request.id,{status:action==='REJECT'?'REJECTED':'APPROVED',federation_id:federation?.id||null,reviewed_by_user_id:user.id,reviewed_at:new Date(clock()).toISOString(),review_reason:p.p_reason||null,review_note:p.p_note||null});
  log(user,'review_organization_'+action.toLowerCase(),'organization_requests',request.id);
  return {success:true,federation_id:federation?.id||null};
 });
}
export function updateAchievementIcon(user,p){if(user?.role!=='admin')fail('Acesso administrativo necessário.',403);const key=p.p_icon_object_key;if(key!==null&&(typeof key!=='string'||key.includes('..')||!/^performance-achievements\/[\w/-]+\.(png|jpe?g|webp)$/i.test(key)))fail('Caminho do ícone inválido.');return transaction(()=>{const row=patch('performance_achievement_types',p.p_achievement_type_id,{icon_object_key:key});log(user,'update_achievement_icon','performance_achievement_types',row.id);return row;});}
function userDetail(id){const u=get('users_profile',id);if(!u)fail('Usuário local não encontrado.',404);const country=u.country_id&&get('countries',u.country_id);return {...u,country_name:country?.name,country_iso2:country?.iso2,roles:where('user_roles','user_id',id).map(r=>get('roles',r.role_id)).filter(Boolean),player_profiles:where('player_profiles','user_id',id).map(r=>({...r,game_name:get('games',r.game_id)?.name})),teams:where('teams','owner_user_id',id).map(r=>({...r,game_name:get('games',r.game_id)?.name})),federations:where('user_federations','user_id',id).map(r=>({...r,name:get('federations',r.federation_id)?.name})),subscriptions:where('subscriptions','user_id',id)};}
export function adminUsers(user,parts,method,p,query){
 if(user?.role!=='admin')fail('Acesso administrativo necessário.',403);
 if(parts[0]==='federations'&&parts[1]==='search')return all('federations').filter(f=>f.name.toLowerCase().includes((query.get('query')||'').toLowerCase())).slice(0,50).map(f=>({...f,countries:get('countries',f.country_id)}));
 if(!parts.length){const search=(query.get('query')||'').toLowerCase(),page=Math.max(1,Number(query.get('page'))||1),size=Math.min(100,Math.max(1,Number(query.get('per_page'))||25));const users=all('users_profile').filter(u=>(u.email+' '+u.display_name).toLowerCase().includes(search));return {users:users.slice((page-1)*size,page*size).map(u=>userDetail(u.id)),total:users.length,total_pages:Math.max(1,Math.ceil(users.length/size))};}
 const id=parts[0];if(parts.length===1&&method==='GET')return userDetail(id);
 if(parts[1]==='roles'&&method==='POST')return transaction(()=>{if(!where('user_roles','user_id',user.id).some(r=>get('roles',r.role_id)?.key==='SUPERADMIN'))fail('Acesso de superadministrador necessário.',403);userDetail(id);const add=p.add||[],drop=p.remove||[];if(!Array.isArray(add)||!Array.isArray(drop)||[...add,...drop].some(k=>!['ADMIN','SUPERADMIN','USER'].includes(k)))fail('Papéis inválidos.');
  const current=where('user_roles','user_id',id),keys=new Set(current.map(r=>get('roles',r.role_id)?.key));drop.forEach(k=>keys.delete(k));add.forEach(k=>keys.add(k));const isAdmin=keys.has('ADMIN')||keys.has('SUPERADMIN');
  const wasAdmin=current.some(r=>['ADMIN','SUPERADMIN'].includes(get('roles',r.role_id)?.key));const otherAdmins=all('user_roles').some(r=>r.user_id!==id&&['ADMIN','SUPERADMIN'].includes(get('roles',r.role_id)?.key)&&get('users_profile',r.user_id));if(!isAdmin&&wasAdmin&&!otherAdmins)fail('Não é permitido remover o último administrador.',409);
  for(const r of current)remove('user_roles',r.id);for(const key of keys){const role=all('roles').find(r=>r.key===key)||save('roles',{key,name:key});save('user_roles',{user_id:id,role_id:role.id});}
  db.prepare('UPDATE accounts SET role=? WHERE id=?').run(isAdmin?'admin':'member',id);log(user,'update_user_roles','users_profile',id);return {success:true};});
 if(parts[1]==='federations')return transaction(()=>{userDetail(id);if(method==='POST'){const federationId=p.federation_id;if(!get('federations',federationId))fail('Federação não encontrada.',404);if(!['ADMIN','STAFF'].includes(p.role))fail('Função inválida.');const old=where('user_federations','user_id',id).find(r=>r.federation_id===federationId);save('user_federations',{...old,user_id:id,federation_id:federationId,role:p.role});}else if(method==='DELETE'){for(const r of where('user_federations','user_id',id).filter(r=>r.id===parts[2]||r.federation_id===parts[2]))remove('user_federations',r.id);}else fail('Método inválido.',405);log(user,'update_user_federations','users_profile',id);return {success:true};});
 fail('Operação de usuário não implementada.',501);
}
