(() => {
 const routes={"/":"/js/route-Index.446a9311.js","/teams-public":"/js/route-TeamsPublic.c87617d7.js","/players-public":"/js/route-PlayersPublic.29920bfe.js","/champions":"/js/route-ChampionsPublic.0f556a57.js","/tournaments-public":"/js/route-TournamentsPublic.f84ecc0c.js","/ranked":"/js/route-RankedPublic.6ee9195e.js","/recruitment":"/js/route-RecruitmentPublic.04740228.js","/transfers":"/js/route-TransfersPublic.bb5147ef.js","/orgs":"/js/route-OrgsPublic.542b5b16.js","/login":"/js/route-AuthRoute.7edf86b1.js","/dashboard":"/js/route-Dashboard.e10db939.js","/profiles":"/js/route-Profiles.8b902a28.js","/teams":"/js/route-Teams.75344530.js","/invites":"/js/route-Invites.c7413ecc.js","/tournaments":"/js/route-Tournaments.2149fa2c.js","/my-orgs":"/js/route-MyOrgs.0db8562a.js","/my-collection":"/js/route-MyCollection.bf1222c2.js","/marketplace":"/js/route-MarketplaceHub.dd3324b5.js","/privacy":"/js/route-PrivacyPolicy.952b459b.js","/regulamentos":"/js/route-RegulationsPublic.f429c14a.js","/onboarding":"/js/route-Onboarding.584e1cb5.js","/reset-password":"/js/route-ResetPassword.b32ff6e0.js","/delete-account":"/js/route-DeleteAccount.536fa1c8.js","/admin":"/js/route-AdminRoute.d4bc5763.js"},prefixes=[["/tournament/","/js/route-TournamentPublic.a5011329.js"],["/p/","/js/route-PlayerPublic.733addc8.js"],["/t/","/js/route-TeamPublic.8aa69ec1.js"],["/org-manage/","/js/route-OrgManage.97f5bcc6.js"],["/org/","/js/route-FederationPublic.591d2d8d.js"],["/blog/","/js/route-BlogPostPublic.cad224ce.js"]],warmed=new Set();
 function prepare(event){
  const link=event.target instanceof Element?event.target.closest('a[href]'):null;
  if(!link||link.hasAttribute('download')||link.target==='_blank'||navigator.connection?.saveData)return;
  let url;try{url=new URL(link.href,location.href)}catch{return}
  if(url.origin!==location.origin)return;
  const path=url.pathname.replace(/\/$/,'')||'/';
  const file=routes[path]||prefixes.find(([prefix])=>path.startsWith(prefix))?.[1];
  if(!file||warmed.has(file))return;
  warmed.add(file);const hint=document.createElement('link');hint.rel='modulepreload';hint.href=file;
  hint.addEventListener('error',()=>{warmed.delete(file);hint.remove()},{once:true});
  document.head.append(hint);
 }
 document.addEventListener('pointerover',prepare,{passive:true});document.addEventListener('focusin',prepare);
 document.addEventListener('pointerdown',prepare,{passive:true});
})();
