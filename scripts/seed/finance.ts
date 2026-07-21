import { faker } from '@faker-js/faker';
import { invoices, payments } from "../../src/db/schema";
import { v4 as uuidv4 } from "uuid";

export async function seedFinance(db: any, orgs: any[], users: any[], deals: any[], projects: any[]) {
  console.log("  ↳ Seeding Finance (Invoices & Payments)...");

  const generatedInvoices = [];
  const generatedPayments = [];
  const internalUsers = users.filter(u => u.userType === "internal");

  for (const project of projects) {
    // Generate 1-2 invoices per project
    const numInvoices = faker.number.int({ min: 1, max: 2 });
    
    for (let i = 0; i < numInvoices; i++) {
      const invoiceId = uuidv4();
      const amount = faker.number.int({ min: 1000, max: 20000 }) * 100;
      const status = faker.helpers.arrayElement(["open", "paid", "overdue"]);
      
      let dueDate = faker.date.future();
      if (status === "overdue") dueDate = faker.date.past();

      generatedInvoices.push({
        id: invoiceId,
        organizationId: project.organizationId,
        projectId: project.id,
        dealId: project.dealId,
        amount,
        status: status === "overdue" ? "open" : status, // Overdue is a computed state usually, but we store it as open with a past due date
        dueDate,
        notes: "Thank you for your business.",
        createdBy: project.createdBy,
      });

      if (status === "paid") {
        generatedPayments.push({
          id: uuidv4(),
          invoiceId,
          amount,
          status: "succeeded",
          provider: "manual",
          method: faker.helpers.arrayElement(["bank_transfer", "upi", "cash"]),
          referenceNumber: faker.string.alphanumeric(10).toUpperCase(),
          verifiedBy: faker.helpers.arrayElement(internalUsers).id,
          verifiedAt: faker.date.recent(),
          paidAt: faker.date.recent(),
          createdBy: faker.helpers.arrayElement(internalUsers).id,
        });
      }
    }
  }

  await db.insert(invoices).values(generatedInvoices);
  if (generatedPayments.length > 0) {
    await db.insert(payments).values(generatedPayments);
  }
}
