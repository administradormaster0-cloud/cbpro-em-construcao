const fs=require('fs'),ts=require('typescript');
for(const name of ['Profiles','Teams']){
const source=fs.readFileSync('.impeccable/reconstruction/incumbent/'+name+'.js','utf8')
 .replaceAll('initial: "hidden"','initial: false')
 .replace('children: "appgamund.com/"','children: window.location.host + "/"')
 .replace('children: [getPublicTenantDomain(), "/"]','children: [window.location.host, "/"]');
const ast=ts.createSourceFile('route.js',source,99,true),ret=ast.statements[0].body.statements.find(ts.isReturnStatement);
let tree=ret.expression;if(ts.isConditionalExpression(tree))tree=tree.whenFalse;
const profiles=name==='Profiles';
const replacement=`(()=>{const managementTree=${tree.getText(ast)};const blocks=managementTree.props.children;const toolbar=blocks[${profiles?1:0}];return jsxRuntimeExports.jsxs('section',{className:'cbpro-management cbpro-management--${profiles?'profiles':'teams'}',children:[${profiles?'blocks[0],':''}jsxRuntimeExports.jsxs('header',{className:'cbpro-management-header',children:[jsxRuntimeExports.jsx('div',{className:'cbpro-management-title',children:${profiles?'toolbar.props.children[0].props.children[1]':'toolbar.props.children[0]'}}),jsxRuntimeExports.jsx('div',{className:'cbpro-management-controls',children:${profiles?'toolbar.props.children.slice(1)':'toolbar.props.children.slice(1)'}})]}),jsxRuntimeExports.jsx('div',{className:'cbpro-management-records',children:blocks[${profiles?2:1}]}),...blocks.slice(${profiles?3:2})]});})()`;
fs.writeFileSync('src/reconstruction/routes/'+name+'.js',source.slice(0,tree.getStart(ast))+replacement+source.slice(tree.end));
}
console.log('Player and team management hierarchy rebuilt; all original action callbacks/dialogs retained.');
