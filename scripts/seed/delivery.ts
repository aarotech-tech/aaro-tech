import { faker } from '@faker-js/faker';
import { projects, tasks, deliverables } from "../../src/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function seedDelivery(db: any, orgs: any[], users: any[], deals: any[]) {
  console.log("  ↳ Seeding Delivery (Projects & Tasks)...");

  const generatedProjects = [];
  const generatedTasks = [];
  const generatedDeliverables = [];
  const internalUsers = users.filter(u => u.userType === "internal");

  // Create Projects from "won" deals
  const wonDeals = deals.filter(d => d.stage === "won");
  
  for (const deal of wonDeals) {
    const projectId = uuidv4();
    generatedProjects.push({
      id: projectId,
      organizationId: deal.organizationId,
      dealId: deal.id,
      name: `${deal.name} Implementation`,
      status: faker.helpers.arrayElement(["active", "paused", "completed"]),
      health: faker.helpers.arrayElement(["green", "yellow", "red"]),
      ownerId: deal.ownerId,
      value: deal.value,
      expectedDeliveryDate: faker.date.future(),
      createdBy: deal.createdBy,
    });

    // Create Tasks
    const numTasks = faker.number.int({ min: 5, max: 15 });
    for (let i = 0; i < numTasks; i++) {
      generatedTasks.push({
        id: uuidv4(),
        projectId,
        assigneeId: faker.helpers.arrayElement(internalUsers).id,
        title: faker.hacker.verb() + " " + faker.hacker.noun(),
        status: faker.helpers.arrayElement(["todo", "in_progress", "done"]),
        dueDate: faker.date.future(),
        priority: faker.helpers.arrayElement(["low", "medium", "high", "urgent"]),
        createdBy: deal.createdBy,
      });
    }

    // Create Deliverables
    const numDeliverables = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < numDeliverables; i++) {
      generatedDeliverables.push({
        id: uuidv4(),
        projectId,
        name: `Final ${faker.commerce.productMaterial()} Asset`,
        status: faker.helpers.arrayElement(["draft", "internal_review", "client_review", "changes_requested", "approved", "delivered"]),
      });
    }
  }

  if (generatedProjects.length > 0) {
    await db.insert(projects).values(generatedProjects);
  }
  if (generatedTasks.length > 0) {
    await db.insert(tasks).values(generatedTasks);
  }
  if (generatedDeliverables.length > 0) {
    await db.insert(deliverables).values(generatedDeliverables);
  }

  return { projects: generatedProjects };
}
