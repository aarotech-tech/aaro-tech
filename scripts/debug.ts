import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const sql = neon(process.env.DATABASE_URL!);

async function check() {
  const sp = await sql`SHOW search_path;`;
  console.log("Search path:", sp);

  const res = await sql`SELECT table_schema, table_name FROM information_schema.tables;`;
  console.log("Tables:", res.filter(x => !['pg_catalog', 'information_schema'].includes(x.table_schema)));
}

check().catch(console.error);
