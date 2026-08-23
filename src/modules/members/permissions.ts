import { type MemberRole } from "@/generated/prisma/client";

export type Permission =
  | "org:update"
  | "org:delete"
  | "members:invite"
  | "members:remove"
  | "members:changeRole"
  | "billing:manage"
  | "apiKeys:create"
  | "apiKeys:delete"
  | "auditLog:view";

const rolePermissions: Record<MemberRole, Permission[]> = {
  OWNER: [
    "org:update",
    "org:delete",
    "members:invite",
    "members:remove",
    "members:changeRole",
    "billing:manage",
    "apiKeys:create",
    "apiKeys:delete",
    "auditLog:view",
  ],
  ADMIN: [
    "org:update",
    "members:invite",
    "members:remove",
    "apiKeys:create",
    "apiKeys:delete",
    "auditLog:view",
  ],
  MEMBER: [
    "apiKeys:create",
    "auditLog:view",
  ],
};

export function hasPermission(role: MemberRole, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

export function getPermissions(role: MemberRole): Permission[] {
  return rolePermissions[role];
}
