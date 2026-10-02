function applyClassificationSeeding(i,o){return generateClassificationSeeding(o).map(st=>{const at=st-1;return at<i.length?i[at]:null})}
