import { describe, it, expect } from "vitest";
import { hasPermission, getPermissions, type Permission } from "@/modules/members/permissions";

describe("hasPermission", () => {
  describe("OWNER role", () => {
    const allPermissions: Permission[] = [
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
    ];

    it.each(allPermissions)("has %s permission", (permission) => {
      expect(hasPermission("OWNER", permission)).toBe(true);
    });
  });

  describe("ADMIN role", () => {
    it("can update org", () => {
      expect(hasPermission("ADMIN", "org:update")).toBe(true);
    });

    it("can invite members", () => {
      expect(hasPermission("ADMIN", "members:invite")).toBe(true);
    });

    it("can remove members", () => {
      expect(hasPermission("ADMIN", "members:remove")).toBe(true);
    });

    it("can manage API keys", () => {
      expect(hasPermission("ADMIN", "apiKeys:create")).toBe(true);
      expect(hasPermission("ADMIN", "apiKeys:delete")).toBe(true);
    });

    it("can view audit logs", () => {
      expect(hasPermission("ADMIN", "auditLog:view")).toBe(true);
    });

    it("can manage files", () => {
      expect(hasPermission("ADMIN", "files:upload")).toBe(true);
      expect(hasPermission("ADMIN", "files:delete")).toBe(true);
    });

    it("cannot delete org", () => {
      expect(hasPermission("ADMIN", "org:delete")).toBe(false);
    });

    it("cannot change member roles", () => {
      expect(hasPermission("ADMIN", "members:changeRole")).toBe(false);
    });

    it("cannot manage billing", () => {
      expect(hasPermission("ADMIN", "billing:manage")).toBe(false);
    });
  });

  describe("MEMBER role", () => {
    it("can create API keys", () => {
      expect(hasPermission("MEMBER", "apiKeys:create")).toBe(true);
    });

    it("can view audit logs", () => {
      expect(hasPermission("MEMBER", "auditLog:view")).toBe(true);
    });

    it("can upload files", () => {
      expect(hasPermission("MEMBER", "files:upload")).toBe(true);
    });

    const restrictedPermissions: Permission[] = [
      "org:update",
      "org:delete",
      "members:invite",
      "members:remove",
      "members:changeRole",
      "billing:manage",
      "apiKeys:delete",
      "files:delete",
    ];

    it.each(restrictedPermissions)("cannot %s", (permission) => {
      expect(hasPermission("MEMBER", permission)).toBe(false);
    });
  });
});

describe("getPermissions", () => {
  it("returns all permissions for OWNER", () => {
    const perms = getPermissions("OWNER");
    expect(perms).toHaveLength(11);
    expect(perms).toContain("org:delete");
    expect(perms).toContain("billing:manage");
  });

  it("returns limited permissions for ADMIN", () => {
    const perms = getPermissions("ADMIN");
    expect(perms).toHaveLength(8);
    expect(perms).not.toContain("org:delete");
    expect(perms).not.toContain("billing:manage");
  });

  it("returns minimal permissions for MEMBER", () => {
    const perms = getPermissions("MEMBER");
    expect(perms).toHaveLength(3);
    expect(perms).toContain("apiKeys:create");
    expect(perms).toContain("auditLog:view");
    expect(perms).toContain("files:upload");
  });
});
