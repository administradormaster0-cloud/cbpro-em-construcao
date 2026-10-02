import {writeFileSync} from 'node:fs';
process.loadEnvFile('.env.supabase.local');
const url=`https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_REF}/config/auth`;
const headers={Authorization:'Bearer '+process.env.SUPABASE_ACCESS_TOKEN,'Content-Type':'application/json'};
const template=(title,body,button)=>`<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#17251c"><h1>FC Clubs</h1><h2>${title}</h2><p>${body}</p><p style="font-size:30px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p><p>Este código é de uso único e expira em 10 minutos.</p><p><a href="{{ .ConfirmationURL }}">${button}</a></p><p>Se você não fez esta solicitação, ignore este e-mail.</p></div>`;
const config={
 external_email_enabled:true,mailer_autoconfirm:false,mailer_otp_exp:600,mailer_otp_length:8,rate_limit_email_sent:30,
 mailer_subjects_confirmation:'Confirme seu cadastro — FC Clubs',
 mailer_templates_confirmation_content:template('Confirme seu e-mail','Confirme seu cadastro para participar do FC Clubs.','Confirmar cadastro'),
 mailer_subjects_magic_link:'Seu código de acesso — FC Clubs',
 mailer_templates_magic_link_content:template('Seu código de acesso','Digite o código na tela de acesso ou use o link abaixo.','Entrar no FC Clubs'),
 mailer_subjects_recovery:'Recuperar acesso — FC Clubs',
 mailer_templates_recovery_content:template('Redefinir sua senha','Recebemos um pedido de recuperação da sua conta.','Escolher nova senha'),
 mailer_subjects_email_change:'Confirme seu novo e-mail — FC Clubs',
 mailer_templates_email_change_content:template('Confirme a alteração','Use o link abaixo para confirmar seu novo endereço de e-mail.','Confirmar novo e-mail'),
 mailer_subjects_reauthentication:'Seu código de confirmação — FC Clubs',
 mailer_templates_reauthentication_content:'<h2>FC Clubs — Confirme sua identidade</h2><p>Seu código: <strong>{{ .Token }}</strong></p><p>Se não solicitou, ignore este e-mail.</p>',
};
const response=await fetch(url,{method:'PATCH',headers,body:JSON.stringify(config)});if(!response.ok)throw Error('Auth configuration HTTP '+response.status+': '+await response.text());
const check=await (await fetch(url,{headers})).json();
for(const [key,value]of Object.entries(config))if(check[key]!==value)throw Error('Auth setting not confirmed: '+key);
const report={at:new Date().toISOString(),project:process.env.SUPABASE_PROJECT_REF,email_confirmation:true,otp_length:check.mailer_otp_length,otp_expiry_seconds:check.mailer_otp_exp,smtp_configured:!!check.smtp_host,email_hourly_limit:check.rate_limit_email_sent,templates_verified:true};
writeFileSync('data/auth-email-configuration.json',JSON.stringify(report,null,2));console.log(report);
