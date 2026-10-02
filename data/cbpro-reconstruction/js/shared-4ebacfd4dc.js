import {playoffRoundLabel} from "./shared-734bac4fb7.js";
const {} = globalThis;
function getPlayoffRoundNames(i,o){const et=Math.log2(i),st=o||i,at=isPowerOf2$2(st)?st:nextPowerOf2$2(st),vt=Math.log2(at),Ct=Math.max(0,et-vt),Tt=[];for(let Lt=0;Lt<et;Lt++)if(Lt<Ct)Tt.push(`Round ${Lt+1}`);else{const $t=Lt-Ct,qt=at/Math.pow(2,$t);Tt.push(playoffRoundLabel(qt/2))}return Tt}
function isPowerOf2$2(i){return i>0&&(i&i-1)===0}
function nextPowerOf2$2(i){let o=1;for(;o<i;)o*=2;return o}
export {getPlayoffRoundNames,isPowerOf2$2,nextPowerOf2$2};
