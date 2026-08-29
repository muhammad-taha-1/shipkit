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
  | "auditLog:view"
  | "files:upload"
  | "files:delete";

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
    "files:upload",
    "files:delete",
  ],
  ADMIN: [
    "org:update",
    "members:invite",
    "members:remove",
    "apiKeys:create",
    "apiKeys:delete",
    "auditLog:view",
    "files:upload",
    "files:delete",
  ],
  MEMBER: [
    "apiKeys:create",
    "auditLog:view",
    "files:upload",
  ],
};

export function hasPermission(role: MemberRole, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

export function getPermissions(role: MemberRole): Permission[] {
  return rolePermissions[role];
}
