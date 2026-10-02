function FeatureCell({value:i,def:o}){
 if(i===undefined||i===null)return jsxRuntimeExports.jsx('span',{className:'cbpro-feature-unspecified',title:'Valor não informado',children:'—'});
 if(o.displayValue){const formatted=o.displayValue(i);if(formatted===undefined||formatted===null||formatted==='undefined'||formatted==='null')return jsxRuntimeExports.jsx('span',{className:'cbpro-feature-unspecified',title:'Valor não informado',children:'—'});return jsxRuntimeExports.jsx('span',{className:'text-xs font-medium text-foreground',children:formatted});}
 if(typeof i==='boolean')return jsxRuntimeExports.jsx(i?Check:X$2,{className:'h-4 w-4 mx-auto','aria-label':i?'Incluído':'Não incluído',role:'img'});
 return jsxRuntimeExports.jsx('span',{className:'text-xs font-medium text-foreground',children:typeof i==='number'?(i>=999?'∞':i):String(i)});
}
