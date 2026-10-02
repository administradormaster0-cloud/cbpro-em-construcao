import "./shared-f6c4e526bd.js";
import "./shared-7ad70ac95c.js";
import "./shared-6b92eaf278.js";
import "./shared-cdd99b42aa.js";
import "./shared-d405dfded2.js";
import {useParams} from "./shared-f6c4e526bd.js";
import {Card} from "./shared-7ad70ac95c.js";
import {CardHeader,CardTitle} from "./shared-6b92eaf278.js";
import {CardContent} from "./shared-cdd99b42aa.js";
import {Badge} from "./shared-d405dfded2.js";
const {reactExports,supabase,Link,Button$1,ArrowLeft,Gamepad2} = globalThis;
function GameDetail(){
 const {id}=useParams();
 const [game,setGame]=reactExports.useState(null),[loading,setLoading]=reactExports.useState(true),[error,setError]=reactExports.useState(''),[attempt,setAttempt]=reactExports.useState(0);
 reactExports.useEffect(()=>{
  let active=true;setGame(null);setError('');setLoading(true);
  if(!id){setLoading(false);return ()=>{active=false};}
  const timer=setTimeout(()=>{if(active){active=false;setLoading(false);setError('A conexão está demorando mais que o esperado. Tente novamente.');}},12000);
  (async()=>{try{
   const result=await supabase.from('games').select('*, game_platforms(platform_id, platforms(key, name))').eq('id',id).maybeSingle();
   if(result.error)throw result.error;
   if(active)setGame(result.data||null);
  }catch(e){if(active)setError('Não foi possível carregar as informações do jogo. Tente novamente.');}
  finally{if(active){clearTimeout(timer);setLoading(false);}}})();
  return ()=>{active=false;clearTimeout(timer);};
 },[id,attempt]);
 const h=jsxRuntimeExports.jsx,hs=jsxRuntimeExports.jsxs;
 const fields=game?[['Gênero',game.genre],['Tipo',game.participant_type],['Nome do placar',game.default_score_label],['Modo de resultado',game.default_result_mode],...(game.participant_type==='TEAM'?[['Tamanho do elenco',[game.min_roster_size??'—',game.max_roster_size??'—'].join(' – ')]]:[])]:[];
 return hs('section',{className:'cbpro-game-detail',children:[
  h(Link,{to:'/games',className:'cbpro-game-back',children:'Voltar aos jogos'}),
  h('header',{children:h('h1',{children:game?.name||'Informações do jogo'})}),
  loading?h('p',{role:'status',children:'Carregando informações…'}):
  error?hs('div',{role:'alert',children:[h('p',{children:error}),h('button',{type:'button',onClick:()=>setAttempt(value=>value+1),children:'Tentar novamente'})]}):
  game?hs('div',{className:'cbpro-game-detail-layout',children:[
   hs('aside',{children:[h(Gamepad2,{'aria-hidden':true}),h('h2',{children:'Formato e plataformas'}),h('p',{children:'Confira as regras de participação e as plataformas deste jogo.'})]}),
   hs('div',{className:'cbpro-game-detail-data',children:[
    h('dl',{children:fields.map(([label,value])=>hs('div',{children:[h('dt',{children:label}),h('dd',{children:value??'Não informado'})]},label))}),
    h('h2',{children:'Plataformas'}),
    game.game_platforms?.length?h('ul',{className:'cbpro-game-platforms',children:game.game_platforms.map((platform,index)=>h('li',{children:platform.platforms?.name||platform.platforms?.key||'Plataforma não informada'},platform.platform_id||index))}):h('p',{children:'Nenhuma plataforma cadastrada.'})
   ]})
  ]}):h('p',{children:'Este jogo não está disponível. Volte à lista e escolha outro.'})
 ]});
}

export default GameDetail;
