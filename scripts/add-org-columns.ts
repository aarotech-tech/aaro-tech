import { db } from "../src/db";
import { sql } from "drizzle-orm";
import "dotenv/config";

async function main() {
  await db.execute(sql`ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tax_id varchar(100), ADD COLUMN IF NOT EXISTS address varchar(255), ADD COLUMN IF NOT EXISTS city varchar(100), ADD COLUMN IF NOT EXISTS country varchar(100);`);
  console.log("Done");
}
main().catch(console.error);
