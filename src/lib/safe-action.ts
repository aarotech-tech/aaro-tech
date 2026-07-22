import { createSafeActionClient } from "next-safe-action";
import { auth } from "@clerk/nextjs/server";
import { requireInternalUser } from "@/lib/auth";

/**
 * Base action client.
 * Use this ONLY for explicitly public actions (e.g. webhooks or public forms).
 */
export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action Error:", e);
    if (e instanceof Error) {
      return e.message;
    }
    return "Something went wrong while executing the operation.";
  },
});

/**
 * Authenticated action client.
 * Ensures the user is logged in. Use this only for actions that don't need a tenant context 
 * (e.g. updating a user's global profile).
 */
export const authActionClient = actionClient.use(async ({ next }) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return next({ ctx: { userId } });
});

/**
 * Tenant-scoped action client.
 * This is the DEFAULT wrapper for all business logic.
 * It strictly requires BOTH a logged-in user and an active organization context.
 */
export const tenantActionClient = authActionClient.use(async ({ next, ctx }) => {
  const { orgId } = await auth();

  if (!orgId) {
    // We explicitly reject operations that lack tenant context.
    throw new Error("Organization Required");
  }

  return next({
    ctx: {
      ...ctx,
      orgId,
    },
  });
});

/**
 * Internal-scoped action client.
 * This client is exclusively for Aarotech staff (Sales, CRM, Finance, Operations, Admin).
 * It verifies `userType === "internal"` and DOES NOT require an active organization context,
 * allowing staff to view and mutate data across all clients.
 */
export const internalActionClient = authActionClient.use(async ({ next, ctx }) => {
  const user = await requireInternalUser(); // Throws ForbiddenError if not internal

  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});
