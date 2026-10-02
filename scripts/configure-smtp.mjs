// Read credentials from .env.smtp.local; never print or include them in reports.
import {existsSync,writeFileSync} from 'node:fs';
process.loadEnvFile('.env.supabase.local');
if(!existsSync('.env.smtp.local'))throw Error('Create .env.smtp.local using .env.smtp.example and the SMTP credentials issued by your provider.');
process.loadEnvFile('.env.smtp.local');
for(const key of ['SMTP_HOST','SMTP_PORT','SMTP_USER','SMTP_PASS','SMTP_FROM_EMAIL'])if(!process.env[key])throw Error('Missing '+key);
const {verifySmtpLogin}=await import('../server/mail.mjs');
await verifySmtpLogin();
const endpoint=`https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_REF}/config/auth`;
const headers={Authorization:'Bearer '+process.env.SUPABASE_ACCESS_TOKEN,'Content-Type':'application/json'};
const config={smtp_host:process.env.SMTP_HOST,smtp_port:String(process.env.SMTP_PORT),smtp_user:process.env.SMTP_USER,smtp_pass:process.env.SMTP_PASS,smtp_admin_email:process.env.SMTP_FROM_EMAIL,smtp_sender_name:'FC Clubs'};
const response=await fetch(endpoint,{method:'PATCH',headers,body:JSON.stringify(config)});
if(!response.ok)throw Error('SMTP configuration HTTP '+response.status);
await response.arrayBuffer();
const check=await (await fetch(endpoint,{headers})).json();
if(check.smtp_host!==config.smtp_host||check.smtp_admin_email!==config.smtp_admin_email)throw Error('SMTP settings were not confirmed.');
writeFileSync('data/smtp-verification.json',JSON.stringify({at:new Date().toISOString(),project:process.env.SUPABASE_PROJECT_REF,smtp_login:true,supabase_configured:true,delivery_verified:false},null,2));
console.log('SMTP authentication and Supabase configuration verified. Inbox delivery must still be tested.');
await import('./configure-auth-email.mjs');
