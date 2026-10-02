const fs=require('fs'),ts=require('typescript');
const name='ChampionsPublic';
const source=fs.readFileSync('.impeccable/reconstruction/incumbent/'+name+'.js','utf8');
const ast=ts.createSourceFile('route.js',source,99,true);
const ret=ast.statements[0].body.statements.find(ts.isReturnStatement);
const navSource=fs.readFileSync('src/reconstruction/routes/TeamsPublic.js','utf8');
const nav=navSource.slice(navSource.indexOf('const newNav='),navSource.indexOf('const shell=')).replace("to:at?'/dashboard':'/login'","to:'/dashboard'");
if(!nav.includes('Navegação principal'))throw new Error('Missing shared public navigation');
const replacement=`const hallTree=${ret.expression.getText(ast)};${nav}
const hallChildren=hallTree.props.children;
const hallContent=hallChildren[1].props.children.props.children;
return jsxRuntimeExports.jsxs('div',{className:'cbpro-directory cbpro-directory--champions',children:[newNav,jsxRuntimeExports.jsx('header',{className:'cbpro-directory-heading',children:hallContent[0]}),jsxRuntimeExports.jsxs('main',{className:'cbpro-directory-workspace',children:[jsxRuntimeExports.jsxs('aside',{className:'cbpro-directory-tools',children:[jsxRuntimeExports.jsx('h2',{children:'Explore as conquistas'}),hallContent[1],hallContent[2]]}),jsxRuntimeExports.jsx('section',{className:'cbpro-directory-results',children:hallContent[3]})]}),...hallChildren.slice(2)]});`;
fs.writeFileSync('src/reconstruction/routes/'+name+'.js',source.slice(0,ret.getStart(ast))+replacement+source.slice(ret.end));
console.log('Champion search and filters moved into scouting rail; original title galleries retained.');
