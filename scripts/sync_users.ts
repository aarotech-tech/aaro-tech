import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/db";
import { users } from "../src/db/schema";
import { createClerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function syncUsers() {
  console.log("Fetching users from Clerk...");
  try {
    const userList = await clerkClient.users.getUserList();
    
    for (const clerkUser of userList.data) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) continue;
      
      const existingUser = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkUser.id)
      });
      
      if (!existingUser) {
        console.log(`Syncing user ${email} to local database...`);
        await db.insert(users).values({
          clerkId: clerkUser.id,
          email: email,
          firstName: clerkUser.firstName || "Unknown",
          lastName: clerkUser.lastName || "Unknown",
          avatarUrl: clerkUser.imageUrl,
          userType: "internal",
          role: "superadmin" // Give superadmin access to recover account
        });
        
        console.log(`Updating Clerk metadata for ${email}...`);
        await clerkClient.users.updateUser(clerkUser.id, {
          publicMetadata: {
            ...clerkUser.publicMetadata,
            userType: "internal",
            role: "superadmin"
          }
        });
      } else {
        console.log(`User ${email} already exists in DB. Syncing Clerk metadata just in case...`);
        await clerkClient.users.updateUser(clerkUser.id, {
          publicMetadata: {
            ...clerkUser.publicMetadata,
            userType: "internal",
            role: "superadmin"
          }
        });
      }
    }
    console.log("Sync complete!");
  } catch (err) {
    console.error("Failed to sync users:", err);
  }
  process.exit(0);
}

syncUsers();
