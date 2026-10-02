import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
// Test fixtures provide their own isolated environment.
if(!process.env.FC_DATA_DIR){
 for(const name of ['.env','.env.smtp.local','.env.local','.env.supabase.local']){
  const path=fileURLToPath(new URL('../'+name,import.meta.url));
  if(existsSync(path))process.loadEnvFile(path);
 }
}
export const cloudOnly=process.env.FC_CLOUD_STORE==='true';
