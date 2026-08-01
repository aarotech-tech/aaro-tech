import { currentUser, auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, organizationMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Ensures the user is logged in via Clerk and has an active database record.
 */
export async function requireAuthenticatedUser() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return redirectToSignIn();
  }

  let dbUser;
  try {
    dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUser.id),
    });

    // Removed auto-privilege escalation block
  } catch (err: any) {
    console.error("Database Connection Failed during Authentication:", err.message);
    throw new Error("Unable to connect to the database. Please verify your Neon DATABASE_URL and ensure the database is active.");
  }

  if (!dbUser) {
    // Auto-create user if they exist in Clerk but not in DB
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      throw new UnauthorizedError("User database record not found and no email available");
    }

    // Check if this should be an internal user using Clerk public metadata
    const isInternal = clerkUser.publicMetadata?.isInternal === true || clerkUser.publicMetadata?.role === 'internal';

    try {
      const [newUser] = await db.insert(users).values({
        clerkId: clerkUser.id,
        email: email,
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        avatarUrl: clerkUser.imageUrl,
        userType: isInternal ? "internal" : "client",
        role: isInternal ? "superadmin" : "client",
        globalRole: isInternal ? "owner" : null
      }).onConflictDoUpdate({
        target: users.clerkId,
        set: { clerkId: clerkUser.id }
      }).returning();

      if (isInternal) {
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(clerkUser.id, {
          publicMetadata: {
            userType: 'internal',
            isInternal: true,
            role: 'internal'
          }
        });
      }

      dbUser = newUser;
    } catch (insertError) {
      console.error("Failed to auto-create missing user:", insertError);
      throw new UnauthorizedError("User database record not found and auto-creation failed");
    }
  }

  if (dbUser.status === "suspended") {
    throw new ForbiddenError("User account is suspended");
  }

  return dbUser;
}

/**
 * Ensures the user is an internal staff member.
 */
export async function requireInternalUser() {
  const user = await requireAuthenticatedUser();

  if (user.userType !== "internal") {
    throw new ForbiddenError("Internal access required");
  }

  return user;
}

/**
 * Ensures the internal user has one of the allowed global roles.
 */
export async function requireInternalRole(allowedRoles: string[]) {
  const user = await requireInternalUser();

  if (!user.globalRole || !allowedRoles.includes(user.globalRole)) {
    throw new ForbiddenError("Insufficient internal role");
  }

  return user;
}

/**
 * @deprecated Do not use this as a substitute for entity-level ownership verification. 
 * Use `requireOrganizationMember` AFTER fetching the entity and deriving its organizationId.
 */
export async function requireOrganizationAccess(orgId: string) {
  const user = await requireAuthenticatedUser();

  if (user.userType === "internal") {
    return { user, role: user.globalRole };
  }

  const membership = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.userId, user.id),
      eq(organizationMembers.organizationId, orgId)
    ),
  });

  if (!membership) {
    throw new ForbiddenError("You do not have access to this organization");
  }

  return { user, role: membership.role };
}

/**
 * Ensures the authenticated user is an active member of the specified organization.
 * MUST be called AFTER fetching the target entity and reading its organizationId.
 * Internal users bypass this check.
 */
export async function requireOrganizationMember(orgId: string) {
  const user = await requireAuthenticatedUser();

  if (user.userType === "internal") {
    return { user, role: user.globalRole };
  }

  const membership = await db.query.organizationMembers.findFirst({
    where: and(
      eq(organizationMembers.userId, user.id),
      eq(organizationMembers.organizationId, orgId)
    ),
  });

  if (!membership) {
    throw new ForbiddenError("You do not belong to this organization");
  }

  return { user, membership };
}

/**
 * Ensures the user has the required permission/role for the specified organization.
 */
export async function requireOrganizationPermission(orgId: string, requiredRole: string) {
  const result = await requireOrganizationMember(orgId);

  if (result.user.userType === "internal") {
    return result; // Internal users have all permissions implicitly for now
  }

  const { user, membership } = result;

  if (membership?.role !== requiredRole && membership?.role !== "admin") {
    throw new ForbiddenError(`You need ${requiredRole} permission to perform this action`);
  }

  return { user, membership };
}
