function ReceivedOffers({onUpdate}) {
 const {user}=useAuth(),{refreshCredits}=useAiCredits();
 const [offers,setOffers]=reactExports.useState([]),[loading,setLoading]=reactExports.useState(true),[error,setError]=reactExports.useState(null),[busy,setBusy]=reactExports.useState(null);
 const version=reactExports.useRef(0),action=reactExports.useRef(false),account=reactExports.useRef(user?.id);account.current=user?.id;
 const load=reactExports.useCallback(async()=>{
  const request=++version.current;setError(null);
  if(!user){setOffers([]);setLoading(false);return}setLoading(true);
  let timer;
  try{
   const read=async()=>{
    const result=await supabase.from('avatar_offers').select('*').eq('seller_user_id',user.id).eq('status','pending').order('created_at',{ascending:false});
    if(result.error)throw result.error;if(!result.data?.length)return [];
    const nft=await supabase.from('avatar_nfts').select('id, style_key, mint_number').in('id',[...new Set(result.data.map(x=>x.nft_id))]);if(nft.error)throw nft.error;
    const byId=new Map((nft.data||[]).map(x=>[x.id,x]));return result.data.map(x=>({...x,nft_style_key:byId.get(x.nft_id)?.style_key,nft_mint_number:byId.get(x.nft_id)?.mint_number}));
   };
   const rows=await Promise.race([read(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Read timeout')),12000)})]);
   if(request===version.current)setOffers(rows);
  }catch(e){if(request===version.current)setError('Não foi possível carregar as ofertas recebidas.');}
  finally{clearTimeout(timer);if(request===version.current)setLoading(false)}
 },[user?.id]);
 reactExports.useEffect(()=>{setOffers([]);setBusy(null);load();return()=>{version.current++}},[load]);
 const decide=async(id,decision)=>{
  if(action.current||!user||!['accept','reject'].includes(decision))return;
  const offer=offers.find(x=>x.id===id),expiry=new Date(offer?.expires_at).getTime();
  if(!offer||!Number.isFinite(expiry)||expiry<=Date.now())return;
  action.current=true;setBusy(id);setError(null);const owner=user.id;
  try{
   const result=await supabase.functions.invoke('accept-offer',{body:{offer_id:id,action:decision}});
   if(result.error)throw result.error;if(!result.data||result.data.error)throw new Error(result.data?.error||'Missing confirmation');
   if(account.current!==owner)return;
   setOffers(previous=>previous.filter(x=>x.id!==id));
   ue$1.success(decision==='accept'?'Oferta aceita! NFT transferido.':'Oferta recusada.');
   try{await refreshCredits();await load();await onUpdate?.()}catch(e){setError('A oferta foi processada, mas os dados não foram atualizados. Atualize a coleção antes de continuar.');}
  }catch(e){if(account.current===owner)setError('Não foi possível confirmar a operação. Atualize as ofertas antes de tentar novamente.');}
  finally{action.current=false;if(account.current===owner)setBusy(null)}
 };
 const h=jsxRuntimeExports.jsx,hs=jsxRuntimeExports.jsxs;
 if(!user)return null;
 return hs('section',{className:'cbpro-received-offers','aria-label':'Ofertas recebidas',children:[
  hs('header',{children:[h('h3',{children:'Ofertas recebidas'}),h('span',{children:offers.length})]}),
  error?hs('div',{role:'alert',children:[h('p',{children:error}),h('button',{type:'button',disabled:busy!==null,onClick:load,children:'Atualizar ofertas'})]}):null,
  loading?h('p',{role:'status',children:'Carregando ofertas…'}):!error&&!offers.length?h('p',{children:'Você ainda não tem ofertas pendentes.'}):null,
  h('ul',{children:offers.map(offer=>{const expiry=new Date(offer.expires_at).getTime(),expired=!Number.isFinite(expiry)||expiry<=Date.now();return hs('li',{children:[
   h('h4',{children:(offer.nft_style_key||'NFT')+' #'+(offer.nft_mint_number??'?')}),
   hs('p',{children:[h('strong',{children:offer.offer_credits}),' créditos']}),
   h('p',{children:expired?'Oferta expirada':'Expira '+formatDistanceToNow(new Date(expiry),{locale:ptBR,addSuffix:true})}),
   !expired?hs('div',{className:'cbpro-offer-actions',children:[h('button',{type:'button',disabled:busy!==null,onClick:()=>decide(offer.id,'accept'),children:busy===offer.id?'Processando…':'Aceitar'}),h('button',{type:'button',disabled:busy!==null,onClick:()=>decide(offer.id,'reject'),children:'Recusar'})]}):null
  ]},offer.id)})})
 ]});
}
