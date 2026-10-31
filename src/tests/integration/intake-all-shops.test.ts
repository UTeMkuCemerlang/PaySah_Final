import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import sharp from 'sharp';
import {withFinalistEnvironment} from '../../scripts/finalist-environment.js';
import {readConfig} from '../../apps/api/src/config.js';
import {receiveTelegram} from '../../apps/api/src/modules/intake/telegram.js';
import {receiveGoogleForm} from '../../apps/api/src/modules/intake/google-form.js';
import {channelOpen} from '../../apps/api/src/modules/intake/links.js';
import {digest} from '../../apps/api/src/modules/intake/transaction.js';
import {LocalReceiptStorage} from '../../apps/api/src/modules/receipts/storage.js';

const shopA='10000000-0000-4000-8000-000000000001',shopB='10000000-0000-4000-8000-000000000002',ownerB='20000000-0000-4000-8000-000000000003';
const env={EXTRACTOR_MODE:'cpu_ocr',TELEGRAM_ENABLED:'true',TELEGRAM_INTAKE_MODE:'demo_link',TELEGRAM_TENANT_ID:shopA,TELEGRAM_BOT_TOKEN:'synthetic-token-only',TELEGRAM_BOT_USERNAME:'paysah_test_bot',TELEGRAM_WEBHOOK_SECRET:'synthetic-secret-only-0123456789012345',INTAKE_HMAC_SECRET:'synthetic-hmac-only-012345678901234567',GOOGLE_FORM_ENABLED:'true',GOOGLE_FORM_TENANT_ID:shopA,GOOGLE_FORM_INGEST_KEY:'synthetic-form-key-0123456789012345678',GOOGLE_FORM_PREFILL_URL:'https://docs.google.com/forms/d/e/x/viewform?entry.1={token}'};
test('one bot and one form can serve every demo shop, and the link decides the shop',{skip:!process.env.TEST_DATABASE_URL},async()=>{
 await withFinalistEnvironment(async(_base,pool)=>{
  const root=await mkdtemp(join(tmpdir(),'paysah-all-shops-')),storage=new LocalReceiptStorage(root);
  try{
   const off=readConfig(env),on=readConfig({...env,INTAKE_ALL_DEMO_SHOPS:'true'});
   assert.equal(await channelOpen(pool,off,'TELEGRAM',shopB),false);assert.equal(await channelOpen(pool,on,'TELEGRAM',shopB),true);assert.equal(await channelOpen(pool,on,'GOOGLE_FORM',shopB),true);
   const real=randomUUID();await pool.query("INSERT INTO tenants(id,name,is_demo) VALUES ($1,'Real shop',false)",[real]);assert.equal(await channelOpen(pool,on,'TELEGRAM',real),false);
   const owner=(await pool.query("SELECT id FROM users WHERE tenant_id=$1 AND role='OWNER' LIMIT 1",[shopB])).rows[0]?.id??ownerB;
   const order=randomUUID(),tgToken=randomBytes(32).toString('base64url'),formToken=randomBytes(32).toString('base64url');
   await pool.query('INSERT INTO orders(id,tenant_id,external_id,total_sen) VALUES ($1,$2,$3,1900)',[order,shopB,`ALL-SHOPS-${randomUUID()}`]);
   await pool.query("INSERT INTO intake_links(id,tenant_id,order_id,channel,connector_id,token_hash,expires_at,created_by) VALUES ($1,$2,$3,'TELEGRAM','team-bot',$4,now()+interval '1 hour',$5),($6,$2,$3,'GOOGLE_FORM','team-form',$7,now()+interval '1 hour',$5)",[randomUUID(),shopB,order,digest(tgToken),owner,randomUUID(),digest(formToken)]);
   const image=await sharp({create:{width:32,height:32,channels:3,background:{r:9,g:40,b:60}}}).png().toBuffer(),notify=async()=>{};
   const body=(id:number,text?:string)=>({update_id:id,message:{message_id:id,from:{id:987},chat:{id:987,type:'private'},...(text?{text}:{photo:[{file_id:`sample-${id}`}]})}});
   // With the setting off, a shop B link is not valid on the configured shop.
   assert.equal((await receiveTelegram(pool,off,storage,body(1,`/start ${tgToken}`),async()=>image,notify)).reason,'LINK_INVALID');
   assert.equal((await receiveTelegram(pool,on,storage,body(2,`/start ${tgToken}`),async()=>image,notify)).status,'ACCEPTED');
   assert.equal((await receiveTelegram(pool,on,storage,body(3),async()=>image,notify)).status,'ACCEPTED');
   const form=await receiveGoogleForm(pool,on,storage,{response_id:`form-${randomUUID()}`,submission_token:formToken,mime_type:'image/png',image_base64:Buffer.from(await sharp({create:{width:33,height:33,channels:3,background:{r:1,g:2,b:3}}}).png().toBuffer()).toString('base64')});
   assert.equal(form.status,'ACCEPTED');
   const receipts=(await pool.query('SELECT tenant_id,intake_channel FROM receipts WHERE order_id=$1',[order])).rows;
   assert.equal(receipts.length,2);assert.ok(receipts.every(r=>r.tenant_id===shopB));assert.deepEqual(receipts.map(r=>r.intake_channel).sort(),['GOOGLE_FORM','TELEGRAM']);
   assert.equal((await pool.query('SELECT count(*)::int AS n FROM receipts r JOIN orders o ON o.id=r.order_id WHERE r.tenant_id=$1 AND o.id=$2',[shopA,order])).rows[0].n,0);
  }finally{await rm(root,{recursive:true,force:true});}
 });
});
