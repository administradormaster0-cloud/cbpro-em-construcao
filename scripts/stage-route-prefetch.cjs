const fs=require('fs');
const manifest=JSON.parse(fs.readFileSync('data/reconstruction-js/manifest.json'));
const routePages={'/':'Index','/teams-public':'TeamsPublic','/players-public':'PlayersPublic','/champions':'ChampionsPublic','/tournaments-public':'TournamentsPublic','/ranked':'RankedPublic','/recruitment':'RecruitmentPublic','/transfers':'TransfersPublic','/orgs':'OrgsPublic','/login':'AuthRoute','/dashboard':'Dashboard','/profiles':'Profiles','/teams':'Teams','/invites':'Invites','/tournaments':'Tournaments','/my-orgs':'MyOrgs','/my-collection':'MyCollection','/marketplace':'MarketplaceHub','/pricing':'Pricing','/privacy':'PrivacyPolicy','/regulamentos':'RegulationsPublic','/avatars':'AvatarGalleryPublic','/onboarding':'Onboarding','/reset-password':'ResetPassword','/delete-account':'DeleteAccount','/admin':'AdminRoute'};
const dynamic=[['/tournament/','TournamentPublic'],['/p/','PlayerPublic'],['/t/','TeamPublic'],['/org-manage/','OrgManage'],['/org/','FederationPublic'],['/blog/','BlogPostPublic']];
const byPage=new Map(manifest.routes.map(r=>[r.page,r.file]));const urls={};
for(const [route,page] of Object.entries(routePages)){const file=byPage.get(page);if(file&&fs.existsSync('data/cbpro-reconstruction/js/'+file))urls[route]='/js/'+file;}
const prefixes=dynamic.flatMap(([route,page])=>{const file=byPage.get(page);return file&&fs.existsSync('data/cbpro-reconstruction/js/'+file)?[[route,'/js/'+file]]:[]});
const client=`(() => {
 const routes=${JSON.stringify(urls)},prefixes=${JSON.stringify(prefixes)},warmed=new Set();
 function prepare(event){
  const link=event.target instanceof Element?event.target.closest('a[href]'):null;
  if(!link||link.hasAttribute('download')||link.target==='_blank'||navigator.connection?.saveData)return;
  let url;try{url=new URL(link.href,location.href)}catch{return}
  if(url.origin!==location.origin)return;
  const path=url.pathname.replace(/\\/$/,'')||'/';
  const file=routes[path]||prefixes.find(([prefix])=>path.startsWith(prefix))?.[1];
  if(!file||warmed.has(file))return;
  warmed.add(file);const hint=document.createElement('link');hint.rel='modulepreload';hint.href=file;
  hint.addEventListener('error',()=>{warmed.delete(file);hint.remove()},{once:true});
  document.head.append(hint);
 }
 document.addEventListener('pointerover',prepare,{passive:true});document.addEventListener('focusin',prepare);
 document.addEventListener('pointerdown',prepare,{passive:true});
})();\n`;
fs.writeFileSync('data/cbpro-reconstruction/cbpro-route-prefetch.js',client);
let html=fs.readFileSync('data/cbpro-reconstruction/index.html','utf8');if(!html.includes('/cbpro-route-prefetch.js'))html=html.replace('</body>','<script src="/cbpro-route-prefetch.js"></script></body>');fs.writeFileSync('data/cbpro-reconstruction/index.html',html);
console.log(JSON.stringify({exactRoutes:Object.keys(urls).length,dynamicRoutes:prefixes.length}));
