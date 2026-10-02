import {where} from './db.mjs';
export function managesOrganization(user,id){return !!user&&!!id&&(user.role==='admin'||where('user_federations','user_id',user.profile_id||user.id).some(row=>row.federation_id===id&&['OWNER','ADMIN'].includes(row.role)));}
export function staffInviteVisible(row,user){return !!user&&(user.role==='admin'||managesOrganization(user,row.federation_id)||String(row.email||'').toLowerCase()===String(user.email||'').toLowerCase()&&!!user.email);}
export function scopeStaffInvites(query,user){
 const memberships=where('user_federations','user_id',user.profile_id||user.id).filter(row=>['OWNER','ADMIN'].includes(row.role));
 const rows=[...memberships.flatMap(row=>where('org_staff_invites','federation_id',row.federation_id)),...(user.email?where('org_staff_invites','email',user.email.toLowerCase()):[])];
 const ids=[...new Set(rows.map(row=>row.id))];
 const prior=query.get('and');const filter='id.in.('+ids.map(id=>JSON.stringify(id)).join(',')+')';query.set('and','('+(prior?prior.slice(1,-1)+',':'')+filter+')');
}
export function validateStaffInvite(method,input,old,user){
 const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
 if(method==='POST'){
  if(!input.email||!/^\S+@\S+\.\S+$/.test(input.email)||input.email!==input.email.trim().toLowerCase())fail('Email de convite inválido.');
  if(!['STAFF','MANAGER','ADMIN'].includes(input.role))fail('Função de convite inválida.');
  if(input.role==='ADMIN'&&user.role!=='admin')fail('Somente SUPERADMIN pode convidar ADMIN.',403);
  if(input.invited_by!==(user.profile_id||user.id))fail('Autor do convite inválido.',403);
  if(input.status&&input.status!=='PENDING')fail('Novo convite deve estar pendente.');
  if(where('org_staff_invites','federation_id',input.federation_id).some(row=>row.email===input.email&&row.status==='PENDING'&&row.id!==old?.id))fail('Este email já possui um convite pendente.',409);
 }else if(method==='PATCH'){
  if(Object.keys(input).some(key=>!['status','responded_at'].includes(key))||input.status!=='CANCELLED'||old.status!=='PENDING')fail('Use o cancelamento de um convite pendente.',409);
  if(input.responded_at&&!Number.isFinite(Date.parse(input.responded_at)))fail('Data de resposta inválida.');
 }
}
