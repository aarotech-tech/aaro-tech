import { auth, clerkClient } from "@clerk/nextjs/server";
import { Role, UserType, ROLES, USER_TYPES } from "./roles";
import { Permission, hasPermission } from "./permissions";

export type AuthContext = {
  userId: string;
  orgId: string | null;
  role: Role;
  userType: UserType;
};

export async function getAuthContext(): Promise<AuthContext | null> {
  const { userId, orgId, sessionClaims } = await auth();
  
  if (!userId) return null;

  // Assuming we store role and userType in clerk public metadata
  const metadata = (sessionClaims?.metadata as Record<string, any>) || {};
  
  const userType: UserType = (metadata.userType as UserType) || USER_TYPES.CLIENT;
  const role: Role = (metadata.role as Role) || ROLES.CLIENT;

  return {
    userId,
    orgId: orgId ?? null,
    role,
    userType,
  };
}

export async function authorize(permission?: Permission): Promise<AuthContext> {
  const context = await getAuthContext();
  
  if (!context) {
    throw new Error("Unauthorized");
  }

  if (permission && !hasPermission(context.role, permission)) {
    throw new Error("Forbidden: Insufficient permissions");
  }

  return context;
}
