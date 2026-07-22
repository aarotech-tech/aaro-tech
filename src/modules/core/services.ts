import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

export const CoreRepo = {
  updateOrg: async (id: string, data: any) => 
    await db.update(organizations).set(data).where(eq(organizations.id, id))
};

export const CoreService = {
  updateOrgSettings: async (id: string, data: any) => CoreRepo.updateOrg(id, data)
};
