import {clock,get,where,save,patch,transaction,log} from './db.mjs';
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status});};
export function buyAvatar(user,p){return transaction(()=>{
 if(!user)fail('Faça login para comprar.',401);
 const buyer=user.profile_id||user.id,listing=get('avatar_listings',p?.listing_id);if(!listing)fail('Anúncio não encontrado.',404);
 if(listing.status!=='active'){
  const trade=where('avatar_trades','listing_id',listing.id).find(row=>row.buyer_user_id===buyer);
  if(listing.status==='sold'&&trade)return {success:true,trade_id:trade.id,nft_id:trade.nft_id,already_processed:true};
  fail('Este anúncio não está mais disponível.',409);
 }
 return settleAvatar(user,listing,buyer);
});}
function settleAvatar(user,listing,buyer,offerId=null){
 const nft=get('avatar_nfts',listing.nft_id);if(!nft||nft.owner_user_id!==listing.seller_user_id)fail('A propriedade do avatar mudou. Atualize a página.',409);
 if(nft.owner_user_id===buyer)fail('Você já é o proprietário deste avatar.',409);
 if(where('avatar_auctions','nft_id',nft.id).some(row=>row.status==='active'))fail('Este avatar está em leilão.',409);
 const price=Number(listing.price_credits),minimum=Number(listing.min_price_credits||0);if(!Number.isSafeInteger(price)||price<1||!Number.isFinite(minimum)||price<minimum)fail('Preço do anúncio inválido.',409);
 const wallets=where('user_ai_credits','user_id',buyer),sellers=where('user_ai_credits','user_id',listing.seller_user_id);
 if(wallets.length!==1||sellers.length>1)fail('Não foi possível confirmar as carteiras de créditos.',409);
 const wallet=wallets[0],balance=Number(wallet.balance);if(!Number.isSafeInteger(balance)||balance<price)fail('INSUFFICIENT_CREDITS',409);
 const fee=Math.ceil(price*.1),received=price-fee,sellerBalance=Number(sellers[0]?.balance||0);if(!Number.isSafeInteger(sellerBalance)||sellerBalance<0||!Number.isSafeInteger(sellerBalance+received))fail('Saldo do vendedor inválido.',409);
 const now=new Date(clock()).toISOString();
 const seller=sellers[0]||save('user_ai_credits',{user_id:listing.seller_user_id,balance:0,created_at:now});
 patch('user_ai_credits',wallet.id,{balance:balance-price});patch('user_ai_credits',seller.id,{balance:sellerBalance+received});
 const trade=save('avatar_trades',{nft_id:nft.id,listing_id:listing.id,...(offerId?{offer_id:offerId}:{}),seller_user_id:listing.seller_user_id,buyer_user_id:buyer,price_credits:price,platform_fee:fee,seller_received:received,created_at:now});
 save('credit_transactions',{user_id:buyer,amount:-price,balance_after:balance-price,type:'avatar_purchase',trade_id:trade.id,description:'Compra de avatar',created_at:now});
 save('credit_transactions',{user_id:listing.seller_user_id,amount:received,balance_after:sellerBalance+received,type:'avatar_sale',trade_id:trade.id,description:'Venda de avatar com taxa de 10%',created_at:now});
 patch('avatar_nfts',nft.id,{owner_user_id:buyer,total_owners:Number(nft.total_owners||1)+1,updated_at:now});
 for(const row of where('avatar_listings','nft_id',nft.id).filter(row=>row.status==='active'))patch('avatar_listings',row.id,{status:row.id===listing.id?'sold':'cancelled',...(row.id===listing.id?{sold_at:now}:{})});
 for(const offer of where('avatar_offers','nft_id',nft.id).filter(row=>row.status==='pending'))patch('avatar_offers',offer.id,{status:offer.id===offerId?'accepted':'rejected',responded_at:now});
 log(user,offerId?'accept_avatar_offer':'buy_avatar','avatar_nfts',nft.id);return {success:true,trade_id:trade.id,nft_id:nft.id,new_balance:balance-price};
}
export function decideAvatarOffer(user,p){return transaction(()=>{
 if(!user)fail('Faça login para responder à oferta.',401);
 const offer=get('avatar_offers',p?.offer_id);if(!offer)fail('Oferta não encontrada.',404);
 if(offer.seller_user_id!==(user.profile_id||user.id))fail('Esta oferta pertence a outro vendedor.',403);
 if(!['accept','reject'].includes(p.action))fail('Resposta de oferta inválida.');
 if(offer.status!=='pending'){
  if(p.action==='reject'&&offer.status==='rejected')return {success:true,already_processed:true};
  const trade=p.action==='accept'&&offer.status==='accepted'&&where('avatar_trades','offer_id',offer.id)[0];
  if(trade)return {success:true,trade_id:trade.id,nft_id:trade.nft_id,already_processed:true};
  fail('Esta oferta já foi respondida.',409);
 }
 if(p.action==='reject'){patch('avatar_offers',offer.id,{status:'rejected',responded_at:new Date(clock()).toISOString()});log(user,'reject_avatar_offer','avatar_offers',offer.id);return {success:true};}
 const expiry=Date.parse(offer.expires_at);if(!Number.isFinite(expiry)||expiry<=clock())fail('Esta oferta expirou.',409);
 if(!offer.buyer_user_id||offer.buyer_user_id===offer.seller_user_id)fail('Comprador da oferta inválido.',409);
 const listing=offer.listing_id?get('avatar_listings',offer.listing_id):null;
 if(offer.listing_id&&(!listing||listing.status!=='active'||listing.nft_id!==offer.nft_id||listing.seller_user_id!==offer.seller_user_id))fail('O anúncio desta oferta não está mais disponível.',409);
 return settleAvatar(user,{id:listing?.id||null,nft_id:offer.nft_id,seller_user_id:offer.seller_user_id,price_credits:offer.offer_credits,min_price_credits:listing?.min_price_credits||0},offer.buyer_user_id,offer.id);
});}
