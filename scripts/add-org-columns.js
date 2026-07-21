const { neon } = require('@neondatabase/serverless');
require('dotenv').config({path: '.env.local'});
async function run() {
  const sql = neon(process.env.DATABASE_URL);
  await sql(`ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tax_id varchar(100), ADD COLUMN IF NOT EXISTS address varchar(255), ADD COLUMN IF NOT EXISTS city varchar(100), ADD COLUMN IF NOT EXISTS country varchar(100);`);
  console.log('Done');
}
run().catch(console.error);
