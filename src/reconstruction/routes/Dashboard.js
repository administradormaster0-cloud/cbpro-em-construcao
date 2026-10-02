function Dashboard(){
 const {t:i}=useTranslation(),[o,et]=reactExports.useState(false),[st,at]=reactExports.useState('profiles'),vt=reactExports.useRef(null);
 const Ct=section=>{vt.current=document.activeElement instanceof HTMLElement?document.activeElement:null;at(section);et(true);};
 const Tt=open=>{et(open);if(!open)requestAnimationFrame(()=>vt.current?.focus());};
 const action=(section,Icon,key,fallback)=>jsxRuntimeExports.jsxs('button',{type:'button',className:'cbpro-desk-action',onClick:()=>Ct(section),children:[jsxRuntimeExports.jsx(Icon,{size:22,'aria-hidden':true}),jsxRuntimeExports.jsx('span',{children:i(key,fallback)}),jsxRuntimeExports.jsx(ChevronRight,{size:18,'aria-hidden':true})]},section);
 return jsxRuntimeExports.jsxs('div',{className:'cbpro-desk',children:[
  jsxRuntimeExports.jsxs('header',{className:'cbpro-desk-heading',children:[jsxRuntimeExports.jsx('h1',{children:'Seu centro de competição'}),jsxRuntimeExports.jsx('p',{children:'Organize seu elenco, acompanhe os campeonatos e resolva o que vem a seguir.'})]}),
  jsxRuntimeExports.jsxs('section',{className:'cbpro-desk-report',children:[jsxRuntimeExports.jsxs('div',{children:[jsxRuntimeExports.jsx('h2',{children:'A partida terminou?'}),jsxRuntimeExports.jsx('p',{children:'Reporte o placar e as estatísticas da sua equipe.'})]}),jsxRuntimeExports.jsx(DashboardReportScore,{label:i('dashboard.reportScore','Reportar placar e estatísticas'),className:'cbpro-desk-report-button'})]}),
  jsxRuntimeExports.jsxs('div',{className:'cbpro-desk-columns',children:[
   jsxRuntimeExports.jsxs('section',{className:'cbpro-desk-section',children:[jsxRuntimeExports.jsx('h2',{children:'Dentro de campo'}),jsxRuntimeExports.jsx('div',{className:'cbpro-desk-actions',children:[action('profiles',UserRound,'dashboard.myPlayers','Meus jogadores'),action('teams',Users,'dashboard.myTeams','Meus times'),action('agenda',CalendarDays,'dashboard.agenda','Agenda'),action('tournaments',Trophy,'dashboard.tournaments','Campeonatos'),action('hire',UserPlus,'dashboard.hire','Contratar'),action('invites',Inbox,'dashboard.invites','Convites')]})]}),
   jsxRuntimeExports.jsxs('section',{className:'cbpro-desk-section',children:[jsxRuntimeExports.jsx('h2',{children:'Sua conta'}),jsxRuntimeExports.jsx('div',{className:'cbpro-desk-actions',children:[action('credits',Coins,'dashboard.buyCredits','Comprar créditos'),action('plan',CreditCard,'dashboard.managePlan','Gerenciar plano'),jsxRuntimeExports.jsx(AccountSettingsModal,{triggerClassName:'cbpro-desk-settings'})]}),jsxRuntimeExports.jsx(Link,{to:'/regulamentos',className:'cbpro-desk-reference',children:'Consultar regulamentos'})]})
  ]}),
  jsxRuntimeExports.jsx(DashboardQuickCenter,{open:o,section:st,onOpenChange:Tt,onSectionChange:at})
 ]});
}
