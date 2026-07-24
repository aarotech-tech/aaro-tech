import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

const connection = neon("postgresql://neondb_owner:npg_fT0SKh6zZXYd@ep-little-salad-ao4vgc6x.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");
const db = drizzle(connection);

async function main() {
  try {
    // 1. Alter deals
    await db.execute(sql`ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "probability" integer DEFAULT 0`);
    await db.execute(sql`ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "forecast_value" integer DEFAULT 0`);
    await db.execute(sql`ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "lost_reason" text`);

    // 2. Create proposal_versions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "proposal_versions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "proposal_id" uuid NOT NULL REFERENCES "proposals"("id") ON DELETE CASCADE,
        "version_number" integer NOT NULL,
        "document_data" text,
        "ai_prompt" text,
        "created_at" timestamp DEFAULT now()
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "proposal_versions_proposal_id_idx" ON "proposal_versions" ("proposal_id")`);

    // 3. Create deal_notes
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "deal_notes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "deal_id" uuid NOT NULL REFERENCES "deals"("id") ON DELETE CASCADE,
        "content" text NOT NULL,
        "author_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "created_at" timestamp DEFAULT now()
      )
    `);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "deal_notes_deal_id_idx" ON "deal_notes" ("deal_id")`);

    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

main();
