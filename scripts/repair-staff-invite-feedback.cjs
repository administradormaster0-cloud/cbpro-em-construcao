const fs=require('fs'),ts=require('typescript');
const file='data/cbpro-reconstruction/js/route-OrgManage.97f5bcc6.js',source=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,99,true);
const node=ast.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='OrgStaffInvites');
let replacement=node.getText(ast);
replacement=replacement.replace('try{const Lr=(await supabase.auth.getSession()).data.session;await supabase.functions.invoke("org-staff-invite",','let deliveryConfirmed=false;try{const Lr=(await supabase.auth.getSession()).data.session;const delivery=await supabase.functions.invoke("org-staff-invite",');
replacement=replacement.replace('}})}catch{}ue$1.success("Convite enviado!")','}});deliveryConfirmed=!delivery.error&&!delivery.data?.error&&delivery.data?.sent===true}catch{}deliveryConfirmed?ue$1.success("Convite enviado por email!"):ue$1.warning("Convite cadastrado. O envio por email não foi confirmado.")');
if(!replacement.includes('deliveryConfirmed?'))throw Error('Expected invite delivery block not found');
fs.writeFileSync('src/reconstruction/routes/OrgStaffInvites.js',replacement+'\n');
for(const target of [file,'data/reconstruction-js/route-OrgManage.97f5bcc6.js']){const text=fs.readFileSync(target,'utf8'),tree=ts.createSourceFile(target,text,99,true),current=tree.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='OrgStaffInvites');fs.writeFileSync(target,text.slice(0,current.getStart(tree))+replacement+text.slice(current.end));}
console.log('Staff invitation feedback now requires confirmed email delivery.');
