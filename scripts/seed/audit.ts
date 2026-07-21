import { faker } from '@faker-js/faker';
import { auditLogs } from "../../src/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function seedAuditLogs(db: any, orgs: any[], users: any[]) {
  console.log("  ↳ Seeding Audit Logs...");

  const generatedLogs = [];
  const internalUsers = users.filter(u => u.userType === "internal");

  for (const org of orgs.slice(1)) {
    // Generate 10-20 random audit events per org
    const numEvents = faker.number.int({ min: 10, max: 20 });
    
    for (let i = 0; i < numEvents; i++) {
      generatedLogs.push({
        id: uuidv4(),
        organizationId: org.id,
        entityType: faker.helpers.arrayElement(["deal", "project", "task", "invoice", "deliverable"]),
        entityId: uuidv4(),
        action: faker.helpers.arrayElement([
          "DealCreated",
          "DealStageChanged",
          "ProjectCreated",
          "TaskCompleted",
          "InvoiceGenerated",
          "PaymentVerified"
        ]),
        userId: faker.helpers.arrayElement(internalUsers).id,
        ipAddress: faker.internet.ipv4(),
        userAgent: faker.internet.userAgent(),
        createdAt: faker.date.recent({ days: 30 }),
      });
    }
  }

  await db.insert(auditLogs).values(generatedLogs);
}
