import {readdirSync,readFileSync,existsSync,statSync,mkdirSync,copyFileSync} from 'node:fs';
import {resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assetLookupName} from '../server/assets.mjs';
const root=fileURLToPath(new URL('../data/uploads/',import.meta.url)),images=fileURLToPath(new URL('../../site/assets/img/',import.meta.url));
const manifest=JSON.parse(readFileSync(fileURLToPath(new URL('../data/media-manifest.json',import.meta.url)),'utf8')),assets=new Map();
for(const name of readdirSync(images)){const file=resolve(images,name),key=assetLookupName(name),old=assets.get(key);if(!old||statSync(file).size>statSync(old).size)assets.set(key,file);}
let copied=0;for(const {key} of manifest){const destination=resolve(root,key);if(!destination.startsWith(resolve(root)+sep)||existsSync(destination))continue;const source=assets.get(assetLookupName(key));if(!source)continue;mkdirSync(dirname(destination),{recursive:true});copyFileSync(source,destination);copied++;}console.log(`Materialized ${copied} bundled images with their original storage paths.`);
