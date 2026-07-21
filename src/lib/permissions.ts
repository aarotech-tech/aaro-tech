import { Role, ROLES } from "./roles";

export const PERMISSIONS = {
  // Organization
  ORG_VIEW: "org:view",
  ORG_EDIT: "org:edit",
  ORG_DELETE: "org:delete",
  
  // Deals
  DEAL_VIEW: "deal:view",
  DEAL_CREATE: "deal:create",
  DEAL_EDIT: "deal:edit",
  DEAL_DELETE: "deal:delete",

  // Projects
  PROJECT_VIEW: "project:view",
  PROJECT_CREATE: "project:create",
  PROJECT_EDIT: "project:edit",

  // Users & Invites
  USER_INVITE: "user:invite",
  USER_REMOVE: "user:remove",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPERADMIN]: Object.values(PERMISSIONS),
  [ROLES.OWNER]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [
    PERMISSIONS.ORG_VIEW, PERMISSIONS.DEAL_VIEW, PERMISSIONS.DEAL_CREATE, PERMISSIONS.DEAL_EDIT,
    PERMISSIONS.PROJECT_VIEW, PERMISSIONS.PROJECT_CREATE, PERMISSIONS.PROJECT_EDIT
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.ORG_VIEW, PERMISSIONS.DEAL_VIEW, PERMISSIONS.PROJECT_VIEW
  ],
  [ROLES.CLIENT]: [
    PERMISSIONS.ORG_VIEW, PERMISSIONS.PROJECT_VIEW
  ]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  if (role === ROLES.SUPERADMIN || role === ROLES.OWNER) return true;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}
