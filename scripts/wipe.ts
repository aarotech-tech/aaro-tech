import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || dbUrl.includes("production") || process.env.NODE_ENV === "production") {
  throw new Error("Refusing to run against production");
}

const sql = neon(dbUrl);

async function wipe() {
  console.log("Dropping and recreating public schema...");
  await sql`DROP SCHEMA public CASCADE;`;
  await sql`CREATE SCHEMA public;`;
  await sql`GRANT ALL ON SCHEMA public TO public;`;
  console.log("Schema wiped.");
}

wipe().catch(console.error);
