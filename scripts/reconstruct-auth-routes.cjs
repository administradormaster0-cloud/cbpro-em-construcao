const fs=require('fs'),ts=require('typescript');
for(const name of ['Login','SignupWizard']){
 const s=fs.readFileSync('.impeccable/reconstruction/incumbent/'+name+'.js','utf8').replaceAll('initial: "enter"','initial: false'),a=ts.createSourceFile('route.js',s,99,true),ret=a.statements[0].body.statements.find(ts.isReturnStatement);
 const signup=name==='SignupWizard',org=signup?'o':'et';
 const assembly=`const authTree=${ret.expression.getText(a)};const authPieces=authTree.props.children;const formPieces=authPieces[2].props.children;
return jsxRuntimeExports.jsxs('div',{className:'cbpro-auth',children:[jsxRuntimeExports.jsxs('aside',{className:'cbpro-auth-story',children:[jsxRuntimeExports.jsx(Link,{to:'/',children:jsxRuntimeExports.jsx('img',{src:'/assets/plates/brand.png',alt:'CBPRO',width:240,height:60})}),jsxRuntimeExports.jsx('h1',{children:'Seu próximo capítulo começa em campo.'}),jsxRuntimeExports.jsx('p',{children:'Clubes, jogadores e campeonatos em um só lugar.'}),jsxRuntimeExports.jsx(Link,{to:'/tournaments-public',children:'Explorar campeonatos'})]}),jsxRuntimeExports.jsxs('main',{className:'cbpro-auth-form',children:[authPieces[0],${org}?formPieces[0]:null,...formPieces.slice(1)]})]});`;
 fs.writeFileSync('src/reconstruction/routes/'+name+'.js',s.slice(0,ret.getStart(a))+assembly+s.slice(ret.end));
}
