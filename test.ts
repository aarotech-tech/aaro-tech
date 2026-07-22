import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "./src/db";
import { deals } from "./src/db/schema";
import { eq } from "drizzle-orm";
import { conversionEngine } from "./src/modules/orchestration/conversion-engine";

async function run() {
  try {
    const dealId = "4d420d69-ed8f-4a5e-83c4-40bb969625d0";
    console.log("Fetching deal...");
    const dealData = await db.select().from(deals).where(eq(deals.id, dealId));
    if (dealData.length > 0) {
      const orgId = dealData[0].organizationId;
      console.log("Found Deal, Organization:", orgId);
      console.log("Forcing Conversion Orchestration...");
      await conversionEngine.handleProposalAccepted(dealId, orgId);
      console.log("Success! Deal marked as won and Project created.");
    } else {
      console.log("Deal not found.");
    }
  } catch (e) {
    console.error("FAILED:", e);
  }
  process.exit(0);
}

run();
