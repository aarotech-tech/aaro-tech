import { promoteLeadToDeal } from "./src/app/actions/leads";
import { db } from "./src/db";
import { websiteLeads } from "./src/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  try {
    const lead = await db.query.websiteLeads.findFirst({
      where: (leads, { eq }) => eq(leads.status, "new")
    });
    
    if (!lead) {
      console.log("No new leads found to promote");
      return;
    }
    
    console.log(`Attempting to promote lead ${lead.id}...`);
    // NOTE: This will fail if requireInternalUser checks auth state.
    // Let's see what happens.
    const result = await promoteLeadToDeal(lead.id);
    console.log("Result:", result);
  } catch (err) {
    console.error("Caught error:", err);
  }
}

main();
