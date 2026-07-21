import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../src/db/schema";
import { seedOrganizationsAndUsers } from "./seed/organizations";
import { seedCrm } from "./seed/crm";
import { seedDelivery } from "./seed/delivery";
import { seedFinance } from "./seed/finance";
import { seedAuditLogs } from "./seed/audit";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

// Load test env if testing, otherwise local
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config({ path: ".env.local" });
}

// Safety check!
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl || dbUrl.includes("production") || process.env.NODE_ENV === "production") {
  console.error("❌ ERROR: Refusing to run seed script in a production environment!");
  process.exit(1);
}

const sqlClient = neon(dbUrl);
const db = drizzle(sqlClient, { schema });

async function clearDatabase() {
  console.log("🧹 Clearing database...");
  
  // Truncate tables with cascade to bypass FK constraints
  // Note: Only safe in test/dev!
  const tables = [
    "audit_logs",
    "payments",
    "invoices",
    "deliverable_versions",
    "deliverables",
    "tasks",
    "projects",
    "proposals",
    "deals",
    "organization_members",
    "users",
    "organizations"
  ];

  for (const table of tables) {
    await db.execute(sql.raw(`TRUNCATE TABLE ${table} CASCADE;`));
  }
  
  console.log("✅ Database cleared.");
}

async function main() {
  console.log("🌱 Starting database seed...");
  
  try {
    await clearDatabase();

    // 1. Core Users and Organizations
    const { orgs, users } = await seedOrganizationsAndUsers(db);
    
    // 2. CRM (Leads and Deals)
    const { deals } = await seedCrm(db, orgs, users);
    
    // 3. Delivery (Projects, Tasks, Deliverables)
    const { projects } = await seedDelivery(db, orgs, users, deals);
    
    // 4. Finance (Invoices, Payments)
    await seedFinance(db, orgs, users, deals, projects);

    // 5. Audit Logs
    await seedAuditLogs(db, orgs, users);

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
