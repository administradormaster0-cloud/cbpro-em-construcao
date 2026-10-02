function AppLayout(){
 const {user:i}=useAuth(),{balance:o,loading:et}=useAiCredits(),[historyOpen,setHistoryOpen]=reactExports.useState(false),[menuOpen,setMenuOpen]=reactExports.useState(false);
 const location=useLocation();
 reactExports.useEffect(()=>setMenuOpen(false),[location.pathname]);
 return jsxRuntimeExports.jsxs(SidebarProvider,{children:[
  jsxRuntimeExports.jsxs('div',{className:'cbpro-workspace',children:[
   jsxRuntimeExports.jsxs('header',{className:'cbpro-workspace-header',children:[
    jsxRuntimeExports.jsx(Link,{to:'/',className:'cbpro-workspace-brand',children:jsxRuntimeExports.jsx('img',{src:'/assets/plates/brand.png',alt:'CBPRO',width:190,height:48})}),
    jsxRuntimeExports.jsxs('button',{type:'button',className:'cbpro-workspace-menu',onClick:()=>setMenuOpen(!menuOpen),'aria-expanded':menuOpen,'aria-controls':'cbpro-workspace-navigation',children:[jsxRuntimeExports.jsx(Menu$1,{size:22,'aria-hidden':true}),'Navegar']}),
    jsxRuntimeExports.jsx(Link,{to:'/tournaments-public',className:'cbpro-workspace-public',children:'Explorar campeonatos'}),jsxRuntimeExports.jsx('button',{type:'button',className:'cbpro-theme-control','aria-label':'Ativar modo escuro',onClick:()=>window.cbproSetTheme(document.documentElement.dataset.cbproTheme==='dark'?'light':'dark'),children:jsxRuntimeExports.jsx('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,'aria-hidden':true,children:jsxRuntimeExports.jsx('path',{d:'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z'})})}),
    i&&!et&&jsxRuntimeExports.jsxs('div',{className:'cbpro-workspace-wallet',children:[jsxRuntimeExports.jsxs('button',{type:'button',onClick:()=>setHistoryOpen(true),'aria-label':'Consultar histórico de créditos',children:[jsxRuntimeExports.jsx(Coins,{size:18,'aria-hidden':true}),String(o)]}),jsxRuntimeExports.jsx(CreditShopModal,{children:jsxRuntimeExports.jsx('button',{type:'button','aria-label':'Comprar créditos',children:jsxRuntimeExports.jsx(Store,{size:20,'aria-hidden':true})})})]})
   ]}),
   jsxRuntimeExports.jsxs('div',{className:'cbpro-workspace-body',children:[jsxRuntimeExports.jsx('div',{id:'cbpro-workspace-navigation',className:'cbpro-workspace-navigation'+(menuOpen?' is-open':''),children:jsxRuntimeExports.jsx(AppSidebar,{})}),jsxRuntimeExports.jsx('main',{className:'cbpro-workspace-content',children:jsxRuntimeExports.jsx(Outlet,{})})]})
  ]}),
  jsxRuntimeExports.jsx(CreditHistoryModal,{open:historyOpen,onOpenChange:setHistoryOpen}),jsxRuntimeExports.jsx(FcClubsUpgradeModal,{})
 ]});
}
