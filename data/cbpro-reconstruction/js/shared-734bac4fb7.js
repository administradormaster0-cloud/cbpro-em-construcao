
const {} = globalThis;
function playoffRoundLabel(i){return i<=1?"Final":i<=2?"Semi Finais":i<=4?"Quartas de Finais":i<=8?"Oitavas de Finais":i<=16?"Round of 16":i<=32?"Round of 32":i<=64?"Round of 64":i<=128?"Round of 128":`Round of ${i}`}
export {playoffRoundLabel};
