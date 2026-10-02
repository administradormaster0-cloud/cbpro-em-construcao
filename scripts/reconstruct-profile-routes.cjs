const fs=require('fs'),ts=require('typescript');
for(const name of ['TeamPublic','PlayerPublic']){
 const source=fs.readFileSync('.impeccable/reconstruction/incumbent/'+name+'.js','utf8').replaceAll('initial: "hidden"','initial: false');
 const ast=ts.createSourceFile('route.js',source,99,true),ret=ast.statements[0].body.statements.find(ts.isReturnStatement);
 let defaultTree=ret.expression;while(ts.isConditionalExpression(defaultTree))defaultTree=defaultTree.whenFalse;
 const isTeam=name==='TeamPublic';
 const tree=`(()=>{const profileTree=${defaultTree.getText(ast)};const sections=profileTree.props.children;return jsxRuntimeExports.jsxs('div',{className:'cbpro-profile cbpro-profile--${isTeam?'club':'player'}',children:${isTeam?"[sections[0],sections[1],jsxRuntimeExports.jsx('header',{className:'cbpro-profile-identity',children:sections[2].props.children[3]}),jsxRuntimeExports.jsx('main',{className:'cbpro-profile-record',children:sections[3]}),sections[4]]":"[sections[1],jsxRuntimeExports.jsx('main',{className:'cbpro-profile-record',children:sections[2]})]"}})})()`;
 // Paid profile variants retain their selected templates and entitlement behavior.
 fs.writeFileSync('src/reconstruction/routes/'+name+'.js',source.slice(0,defaultTree.getStart(ast))+tree+source.slice(defaultTree.end));
}
console.log('Default player and club record shells reconstructed; paid template selections preserved.');
