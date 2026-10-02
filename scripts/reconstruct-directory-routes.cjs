const fs=require('fs'),ts=require('typescript');
fs.mkdirSync('src/reconstruction/routes',{recursive:true});
for(const name of ['TeamsPublic','PlayersPublic']){
 const source=fs.readFileSync('.impeccable/reconstruction/incumbent/'+name+'.js','utf8').replaceAll('initial: "hidden"','initial: false');
 const ast=ts.createSourceFile(name+'.js',source,99,true);
 const fn=ast.statements.find(ts.isFunctionDeclaration);
 const ret=fn.body.statements.find(ts.isReturnStatement);
 if(!ret?.expression)throw new Error(name+' final return not found');
 const club=name==='TeamsPublic';
 const assembly=club?`
 const shell=directoryTree.props.children;
 const heading=shell[1].props.children[2].props.children.props.children;
 const headline=jsxRuntimeExports.jsxs('header',{className:'cbpro-directory-heading',children:[heading[1],heading[2]]});
 const tools=jsxRuntimeExports.jsxs('aside',{className:'cbpro-directory-tools',children:[jsxRuntimeExports.jsx('h2',{children:'Encontre seu clube'}),heading[3],heading[4]]});
 const results=jsxRuntimeExports.jsx('section',{className:'cbpro-directory-results',children:shell[2]});
 return jsxRuntimeExports.jsxs('div',{className:'cbpro-directory cbpro-directory--clubs',children:[shell[0],headline,jsxRuntimeExports.jsxs('main',{className:'cbpro-directory-workspace',children:[tools,results]}),...shell.slice(3)]});
 `:`
 const shell=directoryTree.props.children;
 const content=shell[1].props.children;
 const headline=jsxRuntimeExports.jsx('header',{className:'cbpro-directory-heading',children:content[0]});
 const tools=jsxRuntimeExports.jsxs('aside',{className:'cbpro-directory-tools',children:[jsxRuntimeExports.jsx('h2',{children:'Monte seu elenco'}),content[1],content[2],content[3]]});
 const results=jsxRuntimeExports.jsx('section',{className:'cbpro-directory-results',children:content[4]});
 return jsxRuntimeExports.jsxs('div',{className:'cbpro-directory cbpro-directory--players',children:[shell[0],headline,jsxRuntimeExports.jsxs('main',{className:'cbpro-directory-workspace',children:[tools,results]}),...shell.slice(2)]});
 `;
 const nav=`const newNav=i?null:jsxRuntimeExports.jsxs('nav',{className:'cbpro-directory-nav', 'aria-label':'Navegação principal',children:[jsxRuntimeExports.jsx(Link,{to:'/',children:jsxRuntimeExports.jsx('img',{src:'/assets/plates/brand.png',alt:'CBPRO',width:190,height:48})}),jsxRuntimeExports.jsxs('div',{className:'cbpro-directory-nav-links',children:[['/tournaments-public','Campeonatos'],['/teams-public','Clubes'],['/players-public','Jogadores'],['/champions','Campeões']].map(([to,label])=>jsxRuntimeExports.jsx(Link,{to,children:label},to))}),jsxRuntimeExports.jsxs('details',{children:[jsxRuntimeExports.jsx('summary',{children:'Comunidade'}),jsxRuntimeExports.jsx('div',{children:[['/recruitment','Recrutamento'],['/transfers','Transferências'],['/orgs','Federações'],['/ranked','Ranking dos clubes'],['/rnk-players','Ranking dos jogadores'],['/marketplace','Marketplace'],['/regulamentos','Regulamentos']].map(([to,label])=>jsxRuntimeExports.jsx(Link,{to,children:label},to))})]}),jsxRuntimeExports.jsx('button',{type:'button',className:'cbpro-theme-control','aria-label':'Ativar modo escuro',onClick:()=>window.cbproSetTheme(document.documentElement.dataset.cbproTheme==='dark'?'light':'dark'),children:jsxRuntimeExports.jsx('svg',{width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:2,'aria-hidden':true,children:jsxRuntimeExports.jsx('path',{d:'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z'})})}),jsxRuntimeExports.jsx(Link,{to:at?'/dashboard':'/login',className:'cbpro-directory-account',children:'Minha conta'})]});`;
 const code=source.slice(0,ret.getStart(ast))+'const directoryTree='+ret.expression.getText(ast)+';'+nav+assembly.replaceAll('children:[shell[0],headline','children:[newNav,shell[0],headline')+source.slice(ret.end);
 fs.writeFileSync('src/reconstruction/routes/'+name+'.js',code);
}
console.log('Reconstructed directory hierarchy, retaining incumbent search, filter, pagination, invitation and profile elements.');
