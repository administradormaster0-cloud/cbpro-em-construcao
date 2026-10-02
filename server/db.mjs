import {cloudOnly} from './environment.mjs';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const dataDir = resolve(process.env.FC_DATA_DIR || fileURLToPath(new URL('../data/', import.meta.url)));
mkdirSync(dataDir, { recursive: true });
// In cloud mode the local database file is never opened, including at startup.
// This transient SQL workspace preserves the existing competition algorithms.
export const db = new DatabaseSync(cloudOnly ? ':memory:' : resolve(dataDir, 'fcclubs.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS records (collection TEXT NOT NULL, id TEXT NOT NULL, doc TEXT NOT NULL CHECK(json_valid(doc)), PRIMARY KEY(collection,id));
CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member');
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES accounts(id), expires INTEGER NOT NULL, refresh TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, user_id TEXT, action TEXT, collection TEXT, record_id TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS cloud_changes (sequence INTEGER PRIMARY KEY AUTOINCREMENT, collection TEXT NOT NULL, record_id TEXT NOT NULL, action TEXT NOT NULL, doc TEXT);
CREATE TRIGGER IF NOT EXISTS cloud_record_insert AFTER INSERT ON records BEGIN
 INSERT INTO cloud_changes(collection,record_id,action,doc) VALUES(NEW.collection,NEW.id,'save',NEW.doc); END;
CREATE TRIGGER IF NOT EXISTS cloud_record_update AFTER UPDATE ON records BEGIN
 INSERT INTO cloud_changes(collection,record_id,action,doc) VALUES(NEW.collection,NEW.id,'save',NEW.doc); END;
CREATE TRIGGER IF NOT EXISTS cloud_record_delete AFTER DELETE ON records BEGIN
 INSERT INTO cloud_changes(collection,record_id,action,doc) VALUES(OLD.collection,OLD.id,'delete',NULL); END;
`);
const put = db.prepare('INSERT INTO records(collection,id,doc) VALUES(?,?,?) ON CONFLICT(collection,id) DO UPDATE SET doc=excluded.doc');
export function save(table, row) { const r = { ...row, id: row.id || row.slug || randomUUID() }; put.run(table, String(r.id), JSON.stringify(r)); return r; }
export function get(table, id) { const r = db.prepare('SELECT doc FROM records WHERE collection=? AND id=?').get(table, String(id)); return r ? JSON.parse(r.doc) : null; }
export function all(table) { return db.prepare('SELECT doc FROM records WHERE collection=?').all(table).map(r=>JSON.parse(r.doc)); }
export function remove(table,id) { db.prepare('DELETE FROM records WHERE collection=? AND id=?').run(table,String(id)); }
let savepointId=0;
export function transaction(fn) { const point='fc_tx_'+(++savepointId);db.exec('SAVEPOINT '+point); try { const result=fn(); db.exec('RELEASE SAVEPOINT '+point); return result; } catch(e) { db.exec('ROLLBACK TO SAVEPOINT '+point);db.exec('RELEASE SAVEPOINT '+point);throw e; } }
export function log(user,action,table,id) { if(cloudOnly)return save('fc_audit',{user_id:user?.id||null,action,collection:table,record_id:id||null,created_at:new Date().toISOString()});db.prepare('INSERT INTO audit(user_id,action,collection,record_id) VALUES(?,?,?,?)').run(user?.id || null,action,table,id || null); }
export function field(key) { if(!/^[a-zA-Z_][\w]*(?:->>?[\w]+)*$/.test(key)) throw Object.assign(new Error('Campo inválido'),{status:400}); return `json_extract(doc, '$.${key.replace(/->>?/g,'.')}')`; }
export function where(table,key,value) { return db.prepare(`SELECT doc FROM records WHERE collection=? AND ${field(key)} IS ?`).all(table,value).map(r=>JSON.parse(r.doc)); }
export function patch(table,id,changes) { const row=get(table,id); if(!row) throw Object.assign(new Error('Registro não encontrado'),{status:404}); return save(table,{...row,...changes,id:row.id}); }
