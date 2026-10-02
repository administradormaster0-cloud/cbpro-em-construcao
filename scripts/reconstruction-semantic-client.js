(() => {
  const root=document.documentElement;
  function refreshThemeControls(){document.querySelectorAll('.cbpro-theme-control,[data-region="theme-toggle"]').forEach(button=>{const dark=root.dataset.cbproTheme==='dark';button.setAttribute('aria-pressed',String(dark));button.setAttribute('aria-label',dark?'Ativar modo claro':'Ativar modo escuro');const label=dark?'Modo claro':'Modo escuro';if(button.dataset.region==='theme-toggle'&&button.textContent!==label)button.textContent=label;});}
  window.cbproSetTheme=theme=>{const dark=theme==='dark';root.dataset.cbproTheme=dark?'dark':'light';root.classList.toggle('program-dark',dark);root.classList.toggle('dark',dark);root.style.colorScheme=dark?'dark':'light';try{localStorage.setItem('cbpro.theme',dark?'dark':'light');localStorage.setItem('cbpro-program-theme',dark?'dark':'light');localStorage.setItem('theme',dark?'dark':'light');}catch{}refreshThemeControls();};
  window.cbproSetTheme(root.dataset.cbproTheme||localStorage.getItem('cbpro.theme')||localStorage.getItem('cbpro-program-theme')||'light');
  new MutationObserver(records=>{if(records.some(record=>record.addedNodes.length))refreshThemeControls();}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('storage',event=>{if(event.key==='cbpro.theme'&&event.newValue)window.cbproSetTheme(event.newValue);});
  if(location.pathname!=='/'){root.classList.add('program-secondary');return;}
  const at=id=>document.querySelector(`[data-region="${id}"]`);
  const frame=document.querySelector('#cbpro-program'),layer=document.querySelector('#program-semantic-layer');
  const originals=[...frame.querySelectorAll('[data-region]')].map(el=>({el,parent:el.parentNode}));
  const mobileQuery=matchMedia('(max-width: 760px)');
  function responsive(){
    originals.forEach(({el,parent})=>parent.append(el));
    // Keep semantic ink above the plates after restoring desktop DOM order.
    frame.append(layer);
    frame.querySelectorAll('.program-mobile-group').forEach(el=>el.remove());
    const group=(name,ids)=>{const section=document.createElement('section');section.className='program-mobile-group program-mobile-'+name;ids.forEach(id=>{const el=at(id);if(el)section.append(el);});frame.append(section);return section;};
    group('header',['brand','theme-toggle','account','navigation-links']);
    group('hero',['hero-background','game-label','title-copa','title-starter','title-sorriso','title-de-ouro','hero-trophy','registration-state','start-label','start-date','hero-action']);
    group('schedule',['schedule-heading','schedule-tabs',...Array.from({length:4},(_,i)=>'schedule-row-'+i),'schedule-more']);
    group('news-intro',['news-heading','news-intro','news-link','clubs-link','players-link']);
    for(let i=0;i<3;i++)group('article',i===0?['news-main-image','news-main-meta','news-main-title','news-main-summary','news-main-open']:['news-thumb-'+(i-1),'news-meta-'+(i-1),'news-title-'+(i-1),'news-open-'+(i-1)]);
    group('ranking',['ranking-title','ranking-link']);
    for(let i=0;i<3;i++)group('rank',['rank-number-'+i,'rank-logo-'+i,'rank-name-'+i,'rank-elo-'+i]);
    group('champions',['champions-icon','champions-heading','champions-link']);
    for(let i=0;i<3;i++)group('champion',['champion-trophy-'+i,'champion-name-'+i,'champion-year-'+i]);
    const news=document.createElement('div');news.className='program-mobile-group program-news-desk';
    [...frame.querySelectorAll('.program-mobile-news-intro,.program-mobile-article')].forEach(el=>news.append(el));frame.append(news);
    const standings=document.createElement('aside');standings.className='program-mobile-group program-standings-desk';
    [...frame.querySelectorAll('.program-mobile-ranking,.program-mobile-rank,.program-mobile-champions,.program-mobile-champion')].forEach(el=>standings.append(el));frame.append(standings);
  }
  mobileQuery.addEventListener('change',responsive);responsive();
  const text=(id,value)=>{const el=at(id);if(el)el.textContent=value??'';};
  const date=value=>value?new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo'}).format(new Date(value)):'';
  const mediaRoot='https://fpnzjhbdtcvglhmxvvzt.supabase.co/storage/v1/object/public/';
  const localMedia={};
  function media(id,bucket,key,label){
    const img=at(id);if(!img)return;
    img.alt=label||'';
    if(!key){img.hidden=true;return;}
    img.hidden=false;
    const path=key.split('/').map(encodeURIComponent).join('/');
    const remote=mediaRoot+bucket+'/'+path;
    img.src=localMedia[remote]||remote;
    img.dataset.sourceKey=key;
    img.addEventListener('error',()=>{img.hidden=true;},{once:true});
  }
  const toggle=at('theme-toggle');
  refreshThemeControls();
  toggle.addEventListener('click',()=>window.cbproSetTheme(root.dataset.cbproTheme==='dark'?'light':'dark'));
  let tournaments=[];
  function schedule(status){
    document.querySelectorAll('[data-status]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.status===status)));
    const list=tournaments.filter(t=>t.status===status).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    for(let i=0;i<4;i++){
      const el=at('schedule-row-'+i),t=list[i];el.replaceChildren();
      if(!t){if(i===0)el.textContent='Nenhum campeonato nesta situação';el.removeAttribute('href');continue;}
      el.href='/tournament/'+t.id; const name=document.createElement('span'),meta=document.createElement('small');name.textContent=t.name;meta.textContent=date(t.starts_at);el.append(name,meta);
    }
  }
  document.querySelectorAll('[data-status]').forEach(b=>b.addEventListener('click',()=>schedule(b.dataset.status)));
  const loadSnapshot=()=>fetch(mediaRoot+'cbpro-public-cache/home.json',{signal:AbortSignal.timeout(6000)}).then(r=>{if(!r.ok)throw new Error('snapshot unavailable');return r.json();}).then(data=>{if(!Array.isArray(data?.entries)||!(Date.parse(data.refreshed_at)+180000>Date.now()))throw new Error('Snapshot público desatualizado');return data;});
  const shared=window.cbproEarlySnapshot?.route==='home'?window.cbproEarlySnapshot.promise:null;
  (shared?shared.then(data=>data||loadSnapshot()):loadSnapshot()).then(data=>{
    const rows=name=>[...new Map(data.entries.filter(e=>e.args?.p_collection===name).flatMap(e=>e.result?.rows||[]).map(r=>[r.id,r])).values()];
    tournaments=rows('tournaments');const featured=tournaments.filter(t=>t.status==='REG_OPEN').sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))[0];
    if(featured){
      // The selected record defines every competition fact; no fixture is shipped.
      const words=featured.name.split(/\s+/),lines=[words.shift()||'',words.shift()||'',words.shift()||'',words.join(' ')];
      ['title-copa','title-starter','title-sorriso','title-de-ouro'].forEach((id,i)=>text(id,lines[i]));
      text('registration-state','Inscrições abertas');text('start-label','Início');text('start-date',date(featured.starts_at));at('hero-action').href='/tournament/'+featured.id;
    }else{text('registration-state','Veja os campeonatos da federação.');}
    schedule('REG_OPEN');
    const news=rows('federation_blog_posts').filter(n=>n.published).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    news.slice(0,3).forEach((n,i)=>{text(i===0?'news-main-title':'news-title-'+(i-1),n.title);text(i===0?'news-main-meta':'news-meta-'+(i-1),[n.category,date(n.created_at)].filter(Boolean).join(' · '));if(i===0)text('news-main-summary',n.subtitle||n.content?.slice(0,180));at(i===0?'news-main-open':'news-open-'+(i-1)).href='/blog/'+n.id;media(i===0?'news-main-image':'news-thumb-'+(i-1),'federation-blog',n.cover_image_object_key,n.title);});
    const teams=new Map(rows('teams').map(t=>[t.id,t]));
    rows('ranked_profiles').filter(r=>r.team_id).sort((a,b)=>b.elo_rating-a.elo_rating).slice(0,3).forEach((r,i)=>{const team=teams.get(r.team_id);text('rank-name-'+i,team?.name||'Clube');text('rank-elo-'+i,r.elo_rating);at('rank-name-'+i).href='/t/'+r.team_id;media('rank-logo-'+i,'team-emblems',team?.emblem_object_key,team?.name);});
    tournaments.filter(t=>t.status==='FINISHED').sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,3).forEach((t,i)=>{text('champion-name-'+i,t.name);text('champion-year-'+i,new Date(t.starts_at||t.created_at).getFullYear());at('champion-name-'+i).href='/tournament/'+t.id;media('champion-trophy-'+i,'trophy-images',t.trophy_image_object_key,t.name);});
    root.dataset.programData='ready';
  }).catch(()=>{
    text('title-copa','Competições');text('title-starter','CBPRO');
    text('registration-state','Não foi possível atualizar os dados.');
    text('start-label','');text('start-date','');
    text('schedule-row-0','Programação indisponível');
    text('news-main-title','Notícias indisponíveis');
    text('news-main-summary','Tente novamente para consultar as publicações da federação.');
    for(let i=0;i<3;i++){
      text('rank-name-'+i,'Ranking indisponível');text('champion-name-'+i,'Dados indisponíveis');
      const link=at(i===0?'news-main-open':'news-open-'+(i-1));if(link){link.textContent='Tentar novamente';link.href=location.pathname;}
    }
    const retry=document.createElement('button');retry.type='button';retry.textContent='Tentar novamente';retry.addEventListener('click',()=>location.reload());
    at('registration-state')?.append(' ',retry);root.dataset.programData='error';
  });
})();
