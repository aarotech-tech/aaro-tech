export const ROLES = {
  SUPERADMIN: "superadmin",
  OWNER: "owner",
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
  CLIENT: "client",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const USER_TYPES = {
  INTERNAL: "internal",
  CLIENT: "client",
} as const;

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES];
