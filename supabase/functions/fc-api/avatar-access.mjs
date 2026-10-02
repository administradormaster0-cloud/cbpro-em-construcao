import {clock,get,where} from './db.mjs';
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
const account=user=>user?.profile_id||user?.id;
export function avatarOfferVisible(row,user){return !!user&&(user.role==='admin'||[row.buyer_user_id,row.seller_user_id].includes(account(user)));}
export function scopeAvatarOffers(query,user){const id=account(user),rows=[...where('avatar_offers','buyer_user_id',id),...where('avatar_offers','seller_user_id',id)];const ids=[...new Set(rows.map(row=>row.id))],prior=query.get('and');query.set('and','('+(prior?prior.slice(1,-1)+',':'')+'id.in.('+ids.map(id=>JSON.stringify(id)).join(',')+'))');}
export function canWriteAvatar(user,table,row){if(!user)return false;if(table==='avatar_listings')return row.seller_user_id===account(user)&&get('avatar_nfts',row.nft_id)?.owner_user_id===account(user);if(table==='avatar_offers')return row.buyer_user_id===account(user);return false;}
export function avatarWriteDefaults(table,input){
 if(table==='avatar_listings'){if(input.status&&input.status!=='active')fail('Novo anúncio deve estar ativo.');return {...input,status:'active'};}
 if(table==='avatar_offers'){if(input.status&&input.status!=='pending')fail('Nova oferta deve estar pendente.');return {...input,status:'pending',expires_at:new Date(clock()+48*3600000).toISOString()};}
 return input;
}
function minPrice(nft){const stats=where('style_market_stats','style_key',nft.style_key)[0]||{};return 5+Math.max(0,Math.floor(((Number(stats.max_supply)||50)-(Number(nft.mint_number)||50))/5))+(Number(nft.tournament_wins)||0)*3+Math.max(0,(Number(nft.total_owners)||1)-1)*2+Math.max(0,Math.floor(((Number(stats.floor_price)||5)-5)/3))+Math.max(0,Math.floor(((Number(stats.avg_recent_price)||5)-5)/4))+Math.min(Number(stats.sales_30d)||0,10);}
export function validateAvatarWrite(table,method,input,old,user){
 if(!['avatar_listings','avatar_offers'].includes(table))return;
 if(method!=='POST'){
  if(table==='avatar_offers')fail('Responda à oferta pelo serviço de ofertas.',403);
  if(method!=='PATCH'||Object.keys(input).some(key=>key!=='status')||input.status!=='cancelled'||old?.status!=='active')fail('Use o cancelamento de um anúncio ativo.',409);
  return;
 }
 if(old)fail('Registro já existente.',409);
 const nft=get('avatar_nfts',input.nft_id);if(!nft)fail('Avatar não encontrado.',404);
 if(nft.owner_user_id!==input.seller_user_id)fail('O vendedor não é o proprietário do avatar.',409);
 if(where('avatar_auctions','nft_id',nft.id).some(row=>row.status==='active'))fail('Este avatar está em leilão.',409);
 const price=Number(table==='avatar_listings'?input.price_credits:input.offer_credits),minimum=minPrice(nft);if(!Number.isSafeInteger(price)||price<minimum)fail('O preço mínimo deste avatar é '+minimum+' créditos.',409);
 if(table==='avatar_listings'){
  if(where(table,'nft_id',nft.id).some(row=>row.status==='active'))fail('Este avatar já possui um anúncio ativo.',409);
  input.min_price_credits=minimum;
 }else{
  if(input.buyer_user_id===input.seller_user_id)fail('Você não pode oferecer pelo próprio avatar.',409);
  const listing=input.listing_id&&get('avatar_listings',input.listing_id);if(input.listing_id&&(!listing||listing.status!=='active'||listing.nft_id!==nft.id||listing.seller_user_id!==nft.owner_user_id))fail('Anúncio indisponível.',409);
  if(listing&&price>=Number(listing.price_credits))fail('A oferta deve ser menor que o preço anunciado.',409);
  const wallet=where('user_ai_credits','user_id',account(user))[0];if(!wallet||!Number.isSafeInteger(Number(wallet.balance))||Number(wallet.balance)<price)fail('INSUFFICIENT_CREDITS',409);
  if(where(table,'buyer_user_id',input.buyer_user_id).some(row=>row.nft_id===nft.id&&row.status==='pending'&&Date.parse(row.expires_at)>clock()))fail('Você já tem uma oferta pendente para este avatar.',409);
 }
}
