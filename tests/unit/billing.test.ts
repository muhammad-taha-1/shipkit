import { describe, it, expect } from "vitest";
import { plans, getPlan } from "@/modules/billing/plans";

describe("plans", () => {
  it("defines three plan tiers", () => {
    expect(Object.keys(plans)).toEqual(["FREE", "PRO", "ENTERPRISE"]);
  });

  describe("FREE plan", () => {
    const free = plans.FREE;

    it("has zero price", () => {
      expect(free.price).toBe(0);
    });

    it("has no Stripe price ID", () => {
      expect(free.stripePriceId).toBeNull();
    });

    it("limits members to 3", () => {
      expect(free.limits.maxMembers).toBe(3);
    });

    it("limits API keys to 1", () => {
      expect(free.limits.maxApiKeys).toBe(1);
    });

    it("limits storage to 100 MB", () => {
      expect(free.limits.maxStorageBytes).toBe(100 * 1024 * 1024);
    });
  });

  describe("PRO plan", () => {
    const pro = plans.PRO;

    it("costs $29/month", () => {
      expect(pro.price).toBe(2900);
    });

    it("limits members to 20", () => {
      expect(pro.limits.maxMembers).toBe(20);
    });

    it("limits API keys to 10", () => {
      expect(pro.limits.maxApiKeys).toBe(10);
    });

    it("limits storage to 5 GB", () => {
      expect(pro.limits.maxStorageBytes).toBe(5 * 1024 * 1024 * 1024);
    });
  });

  describe("ENTERPRISE plan", () => {
    const enterprise = plans.ENTERPRISE;

    it("costs $99/month", () => {
      expect(enterprise.price).toBe(9900);
    });

    it("allows unlimited members", () => {
      expect(enterprise.limits.maxMembers).toBe(Infinity);
    });

    it("allows unlimited API keys", () => {
      expect(enterprise.limits.maxApiKeys).toBe(Infinity);
    });

    it("limits storage to 50 GB", () => {
      expect(enterprise.limits.maxStorageBytes).toBe(50 * 1024 * 1024 * 1024);
    });
  });
});

describe("getPlan", () => {
  it("returns the correct plan for each type", () => {
    expect(getPlan("FREE").name).toBe("Free");
    expect(getPlan("PRO").name).toBe("Pro");
    expect(getPlan("ENTERPRISE").name).toBe("Enterprise");
  });

  it("returns the same object as direct access", () => {
    expect(getPlan("PRO")).toBe(plans.PRO);
  });
});

describe("plan ordering", () => {
  it("prices increase from FREE to ENTERPRISE", () => {
    expect(plans.FREE.price).toBeLessThan(plans.PRO.price);
    expect(plans.PRO.price).toBeLessThan(plans.ENTERPRISE.price);
  });

  it("member limits increase from FREE to ENTERPRISE", () => {
    expect(plans.FREE.limits.maxMembers).toBeLessThan(plans.PRO.limits.maxMembers);
    expect(plans.PRO.limits.maxMembers).toBeLessThan(plans.ENTERPRISE.limits.maxMembers);
  });

  it("storage limits increase from FREE to ENTERPRISE", () => {
    expect(plans.FREE.limits.maxStorageBytes).toBeLessThan(plans.PRO.limits.maxStorageBytes);
    expect(plans.PRO.limits.maxStorageBytes).toBeLessThan(plans.ENTERPRISE.limits.maxStorageBytes);
  });
});
