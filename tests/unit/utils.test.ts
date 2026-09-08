import { describe, it, expect } from "vitest";
import { cn, formatCurrency, generateSlug, absoluteUrl, formatBytes } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });
});

describe("formatCurrency", () => {
  it("formats cents to dollars", () => {
    expect(formatCurrency(2900)).toBe("$29.00");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats large amounts", () => {
    expect(formatCurrency(9900)).toBe("$99.00");
  });

  it("formats fractional cents", () => {
    expect(formatCurrency(1050)).toBe("$10.50");
  });
});

describe("generateSlug", () => {
  it("lowercases and hyphenates", () => {
    expect(generateSlug("My Company")).toBe("my-company");
  });

  it("removes special characters", () => {
    expect(generateSlug("Hello, World! #2")).toBe("hello-world-2");
  });

  it("trims leading/trailing hyphens", () => {
    expect(generateSlug("--test--")).toBe("test");
  });

  it("collapses consecutive special chars into one hyphen", () => {
    expect(generateSlug("a   b___c")).toBe("a-b-c");
  });
});

describe("absoluteUrl", () => {
  it("prepends the app URL", () => {
    const original = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://example.com";
    expect(absoluteUrl("/dashboard")).toBe("https://example.com/dashboard");
    process.env.NEXT_PUBLIC_APP_URL = original;
  });
});

describe("formatBytes", () => {
  it("formats zero bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(100 * 1024 * 1024)).toBe("100 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(5 * 1024 * 1024 * 1024)).toBe("5 GB");
  });

  it("respects decimal precision", () => {
    expect(formatBytes(1536, 2)).toBe("1.5 KB");
    expect(formatBytes(1587, 2)).toBe("1.55 KB");
  });
});
