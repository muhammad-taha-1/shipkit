import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createOrgSchema,
  inviteMemberSchema,
  createApiKeySchema,
} from "@/lib/validations";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validData = {
    name: "John Doe",
    email: "john@example.com",
    password: "Password1",
    confirmPassword: "Password1",
  };

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({ ...validData, name: "J" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({ ...validData, password: "Pass1", confirmPassword: "Pass1" });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = registerSchema.safeParse({ ...validData, password: "password1", confirmPassword: "password1" });
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const result = registerSchema.safeParse({ ...validData, password: "Password", confirmPassword: "Password" });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...validData, confirmPassword: "Different1" });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "invalid" });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts valid reset data", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NewPass1!",
      confirmPassword: "NewPass1!",
      token: "abc123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "NewPass1!",
      confirmPassword: "OtherPass1!",
      token: "abc123",
    });
    expect(result.success).toBe(false);
  });
});

describe("createOrgSchema", () => {
  it("accepts valid org data", () => {
    const result = createOrgSchema.safeParse({ name: "My Company", slug: "my-company" });
    expect(result.success).toBe(true);
  });

  it("rejects slug with uppercase", () => {
    const result = createOrgSchema.safeParse({ name: "My Company", slug: "My-Company" });
    expect(result.success).toBe(false);
  });

  it("rejects slug with spaces", () => {
    const result = createOrgSchema.safeParse({ name: "My Company", slug: "my company" });
    expect(result.success).toBe(false);
  });

  it("accepts slug with numbers and hyphens", () => {
    const result = createOrgSchema.safeParse({ name: "My Company 2", slug: "my-company-2" });
    expect(result.success).toBe(true);
  });

  it("rejects too-short name", () => {
    const result = createOrgSchema.safeParse({ name: "A", slug: "a-company" });
    expect(result.success).toBe(false);
  });
});

describe("inviteMemberSchema", () => {
  it("accepts ADMIN role", () => {
    const result = inviteMemberSchema.safeParse({ email: "new@example.com", role: "ADMIN" });
    expect(result.success).toBe(true);
  });

  it("accepts MEMBER role", () => {
    const result = inviteMemberSchema.safeParse({ email: "new@example.com", role: "MEMBER" });
    expect(result.success).toBe(true);
  });

  it("rejects OWNER role", () => {
    const result = inviteMemberSchema.safeParse({ email: "new@example.com", role: "OWNER" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const result = inviteMemberSchema.safeParse({ email: "new@example.com", role: "SUPERUSER" });
    expect(result.success).toBe(false);
  });
});

describe("createApiKeySchema", () => {
  it("accepts valid key data", () => {
    const result = createApiKeySchema.safeParse({ name: "Production Key" });
    expect(result.success).toBe(true);
  });

  it("accepts with expiry", () => {
    const result = createApiKeySchema.safeParse({ name: "Temp Key", expiresIn: "30d" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createApiKeySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid expiry value", () => {
    const result = createApiKeySchema.safeParse({ name: "Key", expiresIn: "7d" });
    expect(result.success).toBe(false);
  });
});
