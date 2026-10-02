
const {instance} = globalThis;
function getPositionLabel(i){if(!i)return"";const o=instance.language;return o==="es"?i.label_es||i.label_ptbr:o==="en"&&i.label_en||i.label_ptbr}
export {getPositionLabel};
