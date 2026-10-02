import {basename} from 'node:path';
// Saved browser downloads replace spaces/parentheses and add a capture hash.
// Match those names without changing the original frontend's storage URLs.
export function assetLookupName(name){return basename(name).replace(/\.[a-z0-9]+(?=\.[^.]+$)/,'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/-\./g,'.').toLowerCase();}
