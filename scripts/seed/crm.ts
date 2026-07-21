import { faker } from '@faker-js/faker';
import { deals } from "../../src/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function seedCrm(db: any, orgs: any[], users: any[]) {
  console.log("  ↳ Seeding CRM (Deals)...");

  const generatedDeals = [];
  const internalUsers = users.filter(u => u.userType === "internal");

  // Create Deals for Client Orgs
  for (const org of orgs.slice(1)) {
    const numDeals = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < numDeals; i++) {
      generatedDeals.push({
        id: uuidv4(),
        organizationId: org.id,
        ownerId: faker.helpers.arrayElement(internalUsers).id,
        name: `${org.name} - ${faker.commerce.productName()} Retainer`,
        stage: faker.helpers.arrayElement(["new", "qualified", "discovery", "proposal_sent", "negotiation", "won", "lost"]),
        value: faker.number.int({ min: 5000, max: 100000 }) * 100, // cents
        expectedCloseDate: faker.date.future(),
        createdBy: faker.helpers.arrayElement(internalUsers).id,
      });
    }
  }

  await db.insert(deals).values(generatedDeals);

  return { deals: generatedDeals };
}
