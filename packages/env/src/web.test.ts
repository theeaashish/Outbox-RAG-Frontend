import { describe, it, expect, vi, beforeEach } from "vitest";

describe("getWebEnv", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns default NODE_ENV when not set", async () => {
    vi.stubEnv("NODE_ENV", "");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    const { getWebEnv } = await import("./web");
    // Empty string is not a valid enum value, so zod default doesn't apply.
    // When NODE_ENV is truly undefined (not set), default kicks in.
    expect(() => getWebEnv()).toThrow();
  });

  it("defaults NODE_ENV to development when undefined", async () => {
    // Don't stub NODE_ENV at all - let it be undefined
    delete process.env.NODE_ENV;
    const { getWebEnv } = await import("./web");
    const env = getWebEnv();
    expect(env.NODE_ENV).toBe("development");
  });

  it("accepts valid NEXT_PUBLIC_API_URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    const { getWebEnv } = await import("./web");
    const env = getWebEnv();
    expect(env.NEXT_PUBLIC_API_URL).toBe("https://api.example.com");
  });

  it("throws on invalid NEXT_PUBLIC_API_URL", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "not-a-url");
    const { getWebEnv } = await import("./web");
    expect(() => getWebEnv()).toThrow();
  });
});
