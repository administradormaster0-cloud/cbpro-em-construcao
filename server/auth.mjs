import { ensureCredits } from './credits.mjs';
import { randomBytes,randomUUID,scryptSync,timingSafeEqual,createHash } from 'node:crypto';
import { existsSync,writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { db,save,get,dataDir,transaction } from './db.mjs';
import { sendMail } from './mail.mjs';
export const hash=s=>createHash('sha256').update(s).digest('hex');
function passwordHash(p){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(p,salt,64).toString('hex');}
function verify(p,stored){if(typeof stored!=='string'||!stored.includes(':'))return false;const [salt,h]=stored.split(':');let expected;try{expected=Buffer.from(h,'hex');}catch{return false;}const actual=scryptSync(p,salt,64);if(expected.length!==actual.length)return false;return timingSafeEqual(actual,expected);}
export function register(email,password,name,role='member'){
 email=String(email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof password!=='string'||password.length<10||password.length>256)throw Object.assign(new Error('Informe um e-mail válido e uma senha de 10 a 256 caracteres.'),{status:400});
 if(db.prepare('SELECT id FROM accounts WHERE email=?').get(email))throw Object.assign(new Error('E-mail já cadastrado.'),{status:409});
 return transaction(()=>{const id=randomUUID();db.prepare('INSERT INTO accounts(id,email,password,role) VALUES(?,?,?,?)').run(id,email,passwordHash(password),role);save('users_profile',{id,email,display_name:name||email.split('@')[0],full_name:name||'',preferred_language:'pt-BR',created_at:new Date().toISOString(),onboarding_completed:true});if(role==='admin'){save('roles',{id:'local-superadmin',key:'SUPERADMIN',name:'Administrador local'});save('user_roles',{user_id:id,role_id:'local-superadmin'});}ensureCredits({id,email,role});return {id,email,role};});
}
export function publicUser(u){return {id:u.id,email:u.email,aud:'authenticated',role:'authenticated',app_metadata:{provider:'email',providers:['email']},user_metadata:{display_name:get('users_profile',u.id)?.display_name||'',role:u.role},created_at:get('users_profile',u.id)?.created_at};}
export function session(u,ttlMs=86400e3){const token=randomBytes(32).toString('base64url'),refresh=randomBytes(32).toString('base64url'),expiresIn=Math.floor(ttlMs/1000);db.prepare('INSERT INTO sessions(token,user_id,expires,refresh) VALUES(?,?,?,?)').run(hash(token),u.id,Date.now()+ttlMs,hash(refresh));return {access_token:token,token_type:'bearer',expires_in:expiresIn,expires_at:Math.floor(Date.now()/1000)+expiresIn,refresh_token:refresh,user:publicUser(u)};}
export function authenticate(req){const token=req.headers.authorization?.replace(/^Bearer /i,'')||req.headers.cookie?.match(/(?:^|;\s*)fc_session=([^;]+)/)?.[1];if(!token)return null;return db.prepare('SELECT a.id,a.email,a.role FROM accounts a JOIN sessions s ON s.user_id=a.id WHERE s.token=? AND s.expires>?').get(hash(token),Date.now())||null;}
export function login(email,password){const u=db.prepare('SELECT * FROM accounts WHERE email=?').get(String(email||'').toLowerCase());if(!u||typeof password!=='string'||password.length>256||!verify(password,u.password))throw Object.assign(new Error('E-mail ou senha incorretos.'),{status:401});return session(u);}
export function refresh(token){const u=db.prepare('SELECT a.* FROM accounts a JOIN sessions s ON s.user_id=a.id WHERE s.refresh=? AND s.expires>?').get(hash(String(token)),Date.now());if(!u)throw Object.assign(new Error('Sessão expirada.'),{status:401});db.prepare('DELETE FROM sessions WHERE refresh=?').run(hash(token));return session(u);}
export function bootstrap(){if(db.prepare("SELECT id FROM accounts WHERE role='admin'").get())return;const password=randomBytes(18).toString('base64url');register('admin@fcclubs.local',password,'Administrador local','admin');writeFileSync(resolve(dataDir,'ACESSO-LOCAL.txt'),`Administrador local\nE-mail: admin@fcclubs.local\nSenha: ${password}\n\nAcesso: http://localhost:3000/manage/\nEsta conta é independente do site original.\n`,{mode:0o600});}


function validEmail(email){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);}
export function safeAppRedirect(candidate, hostHeader, fallbackPath){
 const host=hostHeader||'localhost:3000', origin='http://'+host, fallback=origin+fallbackPath;
 try{const url=new URL(String(candidate||''), origin); if(!['localhost','127.0.0.1',host.split(':')[0]].includes(url.hostname))return fallback; if(url.protocol!=='http:'&&url.protocol!=='https:')return fallback; return url.origin+url.pathname+url.search;}catch{return fallback;}
}
export function authLink(redirectTo, issued, type){
 const url=new URL(redirectTo);
 url.hash=new URLSearchParams({access_token:issued.access_token,refresh_token:issued.refresh_token,expires_in:String(issued.expires_in),token_type:'bearer',type}).toString();
 return url.toString();
}
async function deliverLink(email, redirectTo, type, send){
 const account=db.prepare('SELECT * FROM accounts WHERE email=?').get(email);
 if(!account)return {sent:false};
 const issued=session(account,3600e3);
 const link=authLink(redirectTo, issued, type);
 const recovery=type==='recovery';
 await send({to:email, subject:recovery?'Redefinir senha — FC Clubs':'Seu link de acesso — FC Clubs', text:(recovery?'Recebemos um pedido para redefinir a senha da sua conta FC Clubs.':'Use o link abaixo para entrar no FC Clubs.')+'\n\n'+link+'\n\nO link vale por 1 hora. Se você não pediu, ignore este e-mail.'});
 return {sent:true};
}
export async function requestRecovery(email, redirectTo, send=sendMail){
 const normalized=String(email||'').trim().toLowerCase();
 if(!validEmail(normalized))throw Object.assign(new Error('Informe um e-mail válido.'),{status:400});
 return deliverLink(normalized, redirectTo, 'recovery', send);
}
export async function requestMagicLink(email, redirectTo, createUser=true, send=sendMail){
 const normalized=String(email||'').trim().toLowerCase();
 if(!validEmail(normalized))throw Object.assign(new Error('Informe um e-mail válido.'),{status:400});
 if(!db.prepare('SELECT id FROM accounts WHERE email=?').get(normalized)){
  if(!createUser)return {sent:false};
  register(normalized, randomBytes(24).toString('base64url'), normalized.split('@')[0]);
 }
 return deliverLink(normalized, redirectTo, 'magiclink', send);
}
export function updateAccount(user, body={}){
 if(body.password!==undefined){
  if(typeof body.password!=='string'||body.password.length<10||body.password.length>256)throw Object.assign(new Error('A senha deve ter de 10 a 256 caracteres.'),{status:400});
  db.prepare('UPDATE accounts SET password=? WHERE id=?').run(passwordHash(body.password), user.id);
 }
 let email=user.email;
 if(body.email!==undefined){
  email=String(body.email).trim().toLowerCase();
  if(!validEmail(email))throw Object.assign(new Error('E-mail inválido.'),{status:400});
  if(db.prepare('SELECT id FROM accounts WHERE email=? AND id<>?').get(email, user.id))throw Object.assign(new Error('E-mail já cadastrado.'),{status:409});
  db.prepare('UPDATE accounts SET email=? WHERE id=?').run(email, user.id);
  const profile=get('users_profile', user.id); if(profile)save('users_profile', {...profile, email});
 }
 if(body.data&&typeof body.data==='object'&&body.data.display_name){
  const profile=get('users_profile', user.id)||{id:user.id,email};
  save('users_profile', {...profile, display_name:String(body.data.display_name).slice(0,80)});
 }
 return publicUser(db.prepare('SELECT id,email,role FROM accounts WHERE id=?').get(user.id));
}
