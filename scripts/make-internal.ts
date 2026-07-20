import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Updating all users to be internal...");
  const updated = await db.update(users)
    .set({ userType: "internal", globalRole: "owner", role: "superadmin" })
    .returning();
  
  console.log(`Updated ${updated.length} users successfully!`);
  process.exit(0);
}

main().catch(console.error);
