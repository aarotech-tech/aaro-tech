import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function truncateDB() {
  console.log("Truncating all database tables...");
  try {
    await db.execute(sql`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema() AND tablename != 'drizzle_migrations') LOOP
              EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
    `);
    console.log("Database truncated successfully.");
  } catch (err) {
    console.error("Failed to truncate database:", err);
  }
  process.exit(0);
}

truncateDB();
