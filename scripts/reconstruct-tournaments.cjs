const fs=require('fs'),ts=require('typescript');
const source=fs.readFileSync('.impeccable/reconstruction/incumbent/TournamentsPublic.js','utf8').replaceAll('initial: "hidden"','initial: false');
const ast=ts.createSourceFile('route.js',source,99,true),ret=ast.statements[0].body.statements.find(ts.isReturnStatement);
if(!ts.isConditionalExpression(ret.expression))throw new Error('Unexpected tournament render shape');
const tree=ret.expression.whenFalse.getText(ast);
const navSource=fs.readFileSync('src/reconstruction/routes/TeamsPublic.js','utf8');
const nav=navSource.slice(navSource.indexOf('const newNav='),navSource.indexOf('const shell=')).replace("to:at?'/dashboard':'/login'","to:'/dashboard'");
const replacement=`const tournamentTree=${tree};${nav}
const pieces=tournamentTree.props.children;
const heading=pieces[1].props.children[2].props.children.props.children;
return jsxRuntimeExports.jsxs('div',{className:'cbpro-directory cbpro-directory--tournaments',children:[newNav,jsxRuntimeExports.jsxs('header',{className:'cbpro-directory-heading',children:[heading[1],heading[2]]}),jsxRuntimeExports.jsxs('main',{className:'cbpro-directory-workspace',children:[jsxRuntimeExports.jsxs('aside',{className:'cbpro-directory-tools',children:[jsxRuntimeExports.jsx('h2',{children:'Escolha sua competição'}),pieces[2]]}),jsxRuntimeExports.jsx('section',{className:'cbpro-directory-results',children:Gt?jsxRuntimeExports.jsx('p',{role:'status',children:'Carregando campeonatos…'}):pieces[3]})]}),...pieces.slice(4)]});`;
fs.writeFileSync('src/reconstruction/routes/TournamentsPublic.js',source.slice(0,ret.getStart(ast))+replacement+source.slice(ret.end));
console.log('Competition masthead, filter rail and competition catalogue reconstructed.');
