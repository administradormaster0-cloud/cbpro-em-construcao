import ts from 'typescript';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('../../',import.meta.url)),out=resolve(root,'reverse_engineering/original-admin');
const source=readFileSync(resolve(out,'snapshots/current-public.js'),'utf8'),saved=readFileSync(resolve(root,'site/js/index-CL0UsMlE.rw7div.js'),'utf8');
const hash=s=>createHash('sha256').update(s).digest('hex');
const parse=(s,name)=>{const tree=ts.createSourceFile(name,s,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);if(tree.parseDiagnostics.length)throw new Error('Falha ao analisar '+name);return tree;};
const tree=parse(source,'current.js'),oldTree=parse(saved,'saved.js'),functions=new Map(tree.statements.filter(ts.isFunctionDeclaration).filter(n=>n.name).map(n=>[n.name.text,n])),oldFunctions=new Map(oldTree.statements.filter(ts.isFunctionDeclaration).filter(n=>n.name).map(n=>[n.name.text,n]));
const printer=ts.createPrinter({newLine:ts.NewLineKind.LineFeed});
const raw=n=>source.slice(n.getStart(tree),n.end);
const refs=n=>{const names=new Set();function walk(node){if(ts.isIdentifier(node)&&!(ts.isPropertyAccessExpression(node.parent)&&node.parent.name===node)&&!(ts.isPropertyAssignment(node.parent)&&node.parent.name===node))names.add(node.text);ts.forEachChild(node,walk);}walk(n);return [...names].filter(name=>functions.has(name)&&name!==n.name?.text);};
const roots=[...functions.keys()].filter(n=>/^Admin|^EasyAdminPanel$|^OrgEloRankingAdmin$|^CsvUsersImport$|^Xls.*Import$/.test(n));
roots.push('ManageProvider','WizardContent','generateClassificationSeeding','applyClassificationSeeding');
const selected=new Set(),queue=[...roots],appStart=source.indexOf('function AuthProvider(');
while(queue.length){const name=queue.shift(),node=functions.get(name);if(!node||selected.has(name))continue;selected.add(name);for(const dep of refs(node)){const child=functions.get(dep);if(child.getStart(tree)>Math.max(1500000,appStart)&&dep.length>3&&!selected.has(dep))queue.push(dep);}}
for(const folder of ['functions','raw'])mkdirSync(resolve(out,folder),{recursive:true});
const records=[];
const caseCounts=new Map();for(const name of selected)caseCounts.set(name.toLowerCase(),(caseCounts.get(name.toLowerCase())||0)+1);
for(const name of [...selected].sort()){
 const filename=caseCounts.get(name.toLowerCase())>1?name+'__'+Buffer.from(name).toString('hex'):name;
 const node=functions.get(name),text=raw(node),formatted=printer.printNode(ts.EmitHint.Unspecified,node,tree),old=oldFunctions.get(name),oldText=old?saved.slice(old.getStart(oldTree),old.end):null;
 writeFileSync(resolve(out,'raw',filename+'.js'),text+'\n');
 writeFileSync(resolve(out,'functions',filename+'.js'),'// Extraído do JavaScript público original. Depende do runtime do bundle.\n'+formatted+'\n');
 const tables=[...new Set([...text.matchAll(/\.from\("([^"]+)"/g)].map(m=>m[1]))],rpcs=[...new Set([...text.matchAll(/\.rpc\("([^"]+)"/g)].map(m=>m[1]))],services=[...new Set([...text.matchAll(/\.invoke\("([^"]+)"/g)].map(m=>m[1]))];
 records.push({name,root:roots.includes(name),start:node.getStart(tree),end:node.end,sha256:hash(text),same_as_saved:oldText!==null&&text===oldText,dependencies:refs(node).filter(n=>selected.has(n)),tables,rpcs,services,file:'functions/'+filename+'.js',raw_file:'raw/'+filename+'.js'});
}
const panel=functions.get('AdminPanel'),sections=[];
function visit(node){if(ts.isObjectLiteralExpression(node)){const props=new Map(node.properties.filter(ts.isPropertyAssignment).map(p=>[p.name.getText(tree),p.initializer]));if(props.has('key')&&props.has('component')){const key=props.get('key'),label=props.get('label'),component=props.get('component');if(ts.isStringLiteral(key))sections.push({key:key.text,label:label&&ts.isStringLiteral(label)?label.text:null,component:component.getText(tree),superOnly:props.get('superOnly')?.getText(tree)||null});}}ts.forEachChild(node,visit);}visit(panel);
const manifest={source:'snapshots/current-public.js',sha256:hash(source),functions:records,sections,counts:{functions:records.length,admin_roots:records.filter(r=>r.root).length,sections:sections.length,identical_to_saved:records.filter(r=>r.same_as_saved).length}};
writeFileSync(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2));
writeFileSync(resolve(out,'SECOES.md'),'# Seções do painel original\n\n| Chave | Nome | Componente |\n|---|---|---|\n'+sections.map(s=>'| '+s.key+' | '+(s.label||'Tradução no bundle')+' | `'+s.component.replaceAll('|','\\|')+'` |').join('\n')+'\n');
console.log(JSON.stringify(manifest.counts));
console.log('Diferenças em funções:',records.filter(r=>!r.same_as_saved).map(r=>r.name).join(', '));
