const ts=require('typescript');
module.exports=function(source){const ast=ts.createSourceFile('x',source,99,true);let callback;function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(ast)==='Ir')callback=node.initializer.arguments[0];ts.forEachChild(node,visit)}visit(ast);if(!callback||!ts.isArrowFunction(callback))throw Error('Avatar load callback missing');let body=callback.body.getText(ast).slice(1,-1);body=body.replace('await Promise.all([','await Promise.race([Promise.all([').replace(']), No = {};',']),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error("Timeout")),12000)})]);if([Xr,_n,Mo,In,Uo].some(response=>response.error))throw Error("Read failed");if(requestVersion!==avatarRequest.current)return;const No = {};');if(!body.includes('Read failed'))throw Error('Avatar request boundary changed');
const replacement=`async()=>{const requestVersion=++avatarRequest.current;let timer;setAvatarFailure('');$t(true);try{${body}}catch(error){if(requestVersion===avatarRequest.current)setAvatarFailure('Não foi possível carregar os avatares. Tente novamente.')}finally{clearTimeout(timer);if(requestVersion===avatarRequest.current)$t(false)}}`;
source=source.slice(0,callback.getStart(ast))+replacement+source.slice(callback.end);
source=source.replace('Lr = Xr =>','avatarRequest=reactExports.useRef(0),[avatarFailure,setAvatarFailure]=reactExports.useState(\'\'), Lr = Xr =>');
source=source.replace('Ir(); }, [Ir])','Ir();return()=>{avatarRequest.current++}; }, [Ir])');
return source;
};
