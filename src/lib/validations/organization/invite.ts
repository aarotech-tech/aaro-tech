import { z } from "zod";
import { ROLES } from "@/lib/roles";

export const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum([ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF, ROLES.CLIENT]).default(ROLES.CLIENT),
  organizationId: z.string().uuid("Invalid organization ID"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
