import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { validateEnv } from "@/env";

// Validate env vars immediately upon backend initialization
validateEnv();

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be a Neon postgres connection string");
  }
  const sql = neon(process.env.DATABASE_URL, {
    fetchOptions: {
      cache: "no-store",
    },
  });
  return drizzle(sql, { schema });
}

let _db: ReturnType<typeof getDb> | undefined;

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    if (!_db) _db = getDb();
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});

