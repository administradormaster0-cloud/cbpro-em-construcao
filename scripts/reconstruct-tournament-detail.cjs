const fs=require('fs'),ts=require('typescript');
const source=fs.readFileSync('.impeccable/reconstruction/incumbent/TournamentPublic.js','utf8').replaceAll('initial: "hidden"','initial: false');
const ast=ts.createSourceFile('route.js',source,99,true),ret=ast.statements[0].body.statements.find(ts.isReturnStatement);
const assembly=`const eventTree=${ret.expression.getText(ast)};const eventPieces=eventTree.props.children;
return jsxRuntimeExports.jsxs('div',{className:'cbpro-event',children:[eventPieces[1],jsxRuntimeExports.jsxs('div',{className:'cbpro-event-layout',children:[jsxRuntimeExports.jsx('header',{className:'cbpro-event-identity',children:eventPieces[3]}),jsxRuntimeExports.jsxs('aside',{className:'cbpro-event-summary',children:[jsxRuntimeExports.jsx('h2',{children:'A competição em números'}),eventPieces[4],eventPieces[7]]}),jsxRuntimeExports.jsxs('main',{className:'cbpro-event-content',children:[eventPieces[5],eventPieces[6],eventPieces[8],eventPieces[9]]})]}),eventPieces[2],eventPieces[10],...eventPieces.slice(11)]});`;
fs.writeFileSync('src/reconstruction/routes/TournamentPublic.js',source.slice(0,ret.getStart(ast))+assembly+source.slice(ret.end));
console.log('Competition identity, summary rail and tabbed records rebuilt; registration/payment handlers retained.');
