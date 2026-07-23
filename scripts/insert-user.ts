import { db } from "../src/db";
import { users } from "../src/db/schema";

async function testInsert() {
  try {
    const [newUser] = await db.insert(users).values({
      clerkId: "test_clerk_id_123",
      email: "test@aarotech.in",
      firstName: "",
      lastName: "",
      userType: "internal",
      role: "superadmin",
      globalRole: "owner"
    }).returning();
    console.log("Insert Success:", newUser);
  } catch (err: any) {
    console.error("Insert Failed:");
    console.error(err);
  }
  process.exit(0);
}
testInsert();
