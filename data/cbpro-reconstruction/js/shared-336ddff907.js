
const {parseStorageReference} = globalThis;
function organizationStorageKey(i,o){const et=o==null?void 0:o.trim();if(!et)return null;const st=parseStorageReference(et);return st?st.bucket===i?st.objectKey:null:/^[a-z][a-z\d+.-]*:\/\//i.test(et)?null:et}
export {organizationStorageKey};
