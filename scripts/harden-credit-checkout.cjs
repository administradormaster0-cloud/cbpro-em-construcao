module.exports=function(source){
 const replace=(old,next)=>{if(!source.includes(old))throw new Error('Credit checkout anchor missing: '+old.slice(0,70));source=source.replace(old,next)};
 replace('}) { const { t: at }', '}) { const creditRequest = reactExports.useRef(false); const { t: at }');
 replace('onPixGenerated: Ir => { Gt(Ir)', 'onPixGenerated: Ir => { creditRequest.current=false; Gt(Ir)');
 replace('onError: Ir => { ue$1.error', 'onError: Ir => { creditRequest.current=false; ue$1.error');
 replace('rr = Ir => { if (!i)', 'rr = Ir => { if(creditRequest.current)return; if (!i)');
 replace('nr = async () => { if (Tt) {', 'nr = async () => { if (Tt && i && !creditRequest.current && !$t && !Kt.pixLoading) { creditRequest.current=true;');
 replace('qt(null), st(null);', 'creditRequest.current=false; qt(null), st(null);');
 replace('jr = () => { Tt && (qt("pix"), Kt.requestPix({ paymentType: "credits", packageId: Tt })); }', 'jr = () => { if(Tt && i && !creditRequest.current && !$t && !Kt.pixLoading){creditRequest.current=true;qt("pix");try{Kt.requestPix({ paymentType: "credits", packageId: Tt });}catch(error){creditRequest.current=false;qt(null);ue$1.error("Não foi possível iniciar o PIX.");}} }');
 return source;
};
