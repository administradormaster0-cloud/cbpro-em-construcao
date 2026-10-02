function PlayerPeriodNav({seasons:i,currentSeason:o,value:et,onChange:st}){
 const uid=reactExports.useId(),panelId='player-period-panel-'+uid;
 const periods=[{id:'current',name:o?'Temporada atual · '+o.name:'Temporada atual'},{id:'career',name:'Carreira'},...i.filter(s=>s.id!==o?.id&&new Date(s.starts_at).getTime()<=Date.now()).sort((a,b)=>new Date(b.starts_at)-new Date(a.starts_at)).map(s=>({id:s.id,name:s.name}))];
 const nav=reactExports.useRef(null);
 reactExports.useEffect(()=>{
  const panel=nav.current?.nextElementSibling;
  if(!panel)return;
  panel.id=panelId;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','player-period-tab-'+uid+'-'+et);panel.tabIndex=0;panel.dataset.period=et;
 },[panelId,uid,et]);
 const keydown=(event,index)=>{
  let next=index;
  if(event.key==='ArrowRight')next=(index+1)%periods.length;
  else if(event.key==='ArrowLeft')next=(index-1+periods.length)%periods.length;
  else if(event.key==='Home')next=0;
  else if(event.key==='End')next=periods.length-1;
  else return;
  event.preventDefault();st(periods[next].id);nav.current?.querySelectorAll('[role=tab]')[next]?.focus();
 };
 return jsxRuntimeExports.jsx('section',{ref:nav,className:'cbpro-profile-periods','aria-label':'Período do perfil',children:jsxRuntimeExports.jsx('div',{role:'tablist','aria-label':'Períodos',children:periods.map((period,index)=>jsxRuntimeExports.jsx('button',{id:'player-period-tab-'+uid+'-'+period.id,type:'button',role:'tab','aria-controls':panelId,'aria-selected':et===period.id,tabIndex:et===period.id?0:-1,onClick:()=>st(period.id),onKeyDown:event=>keydown(event,index),children:period.name},period.id))})});
}
