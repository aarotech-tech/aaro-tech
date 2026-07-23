import { db } from "../src/db";
import { users } from "../src/db/schema";

async function check() {
  try {
    const allUsers = await db.select().from(users);
    console.log("Users in DB:", allUsers.length);
    console.log(JSON.stringify(allUsers, null, 2));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
check();
