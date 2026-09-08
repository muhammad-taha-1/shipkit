import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/redis", () => ({ redis: null }));

const { rateLimit } = await import("@/lib/rate-limit");

describe("rateLimit (in-memory fallback)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows requests within the limit", async () => {
    const key = `test-allow-${Date.now()}`;
    const result = await rateLimit(key, { maxAttempts: 3, windowMs: 60_000 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests beyond the limit", async () => {
    const key = `test-block-${Date.now()}`;
    await rateLimit(key, { maxAttempts: 2, windowMs: 60_000 });
    await rateLimit(key, { maxAttempts: 2, windowMs: 60_000 });
    const result = await rateLimit(key, { maxAttempts: 2, windowMs: 60_000 });
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after the window expires", async () => {
    const key = `test-reset-${Date.now()}`;
    await rateLimit(key, { maxAttempts: 1, windowMs: 1_000 });

    const blocked = await rateLimit(key, { maxAttempts: 1, windowMs: 1_000 });
    expect(blocked.success).toBe(false);

    vi.advanceTimersByTime(1_100);

    const allowed = await rateLimit(key, { maxAttempts: 1, windowMs: 1_000 });
    expect(allowed.success).toBe(true);
  });

  it("tracks remaining count accurately", async () => {
    const key = `test-remaining-${Date.now()}`;

    const r1 = await rateLimit(key, { maxAttempts: 3, windowMs: 60_000 });
    expect(r1.remaining).toBe(2);

    const r2 = await rateLimit(key, { maxAttempts: 3, windowMs: 60_000 });
    expect(r2.remaining).toBe(1);

    const r3 = await rateLimit(key, { maxAttempts: 3, windowMs: 60_000 });
    expect(r3.remaining).toBe(0);
  });

  it("works with preset option", async () => {
    const key = `test-preset-${Date.now()}`;
    const result = await rateLimit(key, { preset: "auth" });
    expect(result.success).toBe(true);
  });
});
