import { describe, it, expect, beforeEach, vi } from "vitest";

let lastConstructedConfig: any = null;

vi.mock("../api-client", () => {
  class ApiClient {
    public config: any;
    constructor(cfg: any) {
      this.config = cfg;
      lastConstructedConfig = cfg;
    }
  }
  return { ApiClient };
});

import { ApiClientBuilder } from "../api-client-builder";

describe("ApiClientBuilder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastConstructedConfig = null;
  });

  it("create() requires non-empty baseUrl and validates it as URL", () => {
    expect(() => ApiClientBuilder.create("")).toThrow(/baseUrl is required/i);
    expect(() => ApiClientBuilder.create("not-a-url")).toThrow(/invalid baseUrl/i);
    expect(() => ApiClientBuilder.create("https://api.test")).not.toThrow();
  });

  it("withBaseUrl validates and sets baseUrl", () => {
    const b = ApiClientBuilder.create("https://a");
    b.withBaseUrl("https://b/path");
    const client = b.build();
    expect(lastConstructedConfig.baseUrl).toBe(new URL("https://b/path").toString());
    expect(client).toBeTruthy();
  });

  it("withTimeout floors positive numbers and rejects non-positive", () => {
    const b = ApiClientBuilder.create("https://a");
    expect(() => b.withTimeout(0)).toThrow(/ms must be > 0/i);
    expect(() => b.withTimeout(-5)).toThrow(/ms must be > 0/i);
    b.withTimeout(123.8);
    b.build();
    expect(lastConstructedConfig.timeoutMs).toBe(123);
  });

  it("withDefaultHeaders merges and stringifies values, skipping nullish", () => {
    const b = ApiClientBuilder.create("https://a")
      .withDefaultHeaders({ A: "x" })
      .withDefaultHeaders({ B: 2, C: true, D: undefined as any, E: null as any });
    b.build();
    expect(lastConstructedConfig.defaultHeaders).toEqual({ A: "x", B: "2", C: "true" });
    expect(lastConstructedConfig.defaultHeaders).not.toHaveProperty("D");
    expect(lastConstructedConfig.defaultHeaders).not.toHaveProperty("E");
  });

  it("withHeader sets a single header and requires name", () => {
    const b = ApiClientBuilder.create("https://a").withHeader("X", 5);
    expect(() => ApiClientBuilder.create("https://a").withHeader("", "v")).toThrow(
      /name is required/i
    );
    b.build();
    expect(lastConstructedConfig.defaultHeaders).toMatchObject({ X: "5" });
  });

  it("withTokenProvider, withTokenFailureMode propagate into final config", () => {
    const getToken = vi.fn(async () => "t");
    const b = ApiClientBuilder.create("https://a")
      .withTokenProvider(getToken)
      .withTokenFailureMode("throw");
    b.build();
    expect(typeof lastConstructedConfig.getToken).toBe("function");
    expect(lastConstructedConfig.tokenFailureMode).toBe("throw");
  });

  it("withLogger accept null/undefined and omit fields", () => {
    const b = ApiClientBuilder.create("https://a")
      .withLogger(undefined as any);
    b.build();
    expect(lastConstructedConfig.logger).toBeUndefined();
  });

  it("withClientName requires non-empty and sets name", () => {
    const b = ApiClientBuilder.create("https://a");
    expect(() => b.withClientName("")).toThrow(/name is required/i);
    b.withClientName("frontend").build();
    expect(lastConstructedConfig.clientName).toBe("frontend");
  });

  it("onAnyError wires handler to onError", () => {
    const handler = vi.fn();
    const b = ApiClientBuilder.create("https://a").onAnyError(handler);
    b.build();
    expect(typeof lastConstructedConfig.onError).toBe("function");
  });

  it("onUnauthorized currently wires to onError (exposes current behavior)", () => {
    const handler = vi.fn();
    const b = ApiClientBuilder.create("https://a").onUnauthorized(handler);
    b.build();
    expect(typeof lastConstructedConfig.onUnauthorized).toBe("function");
    expect(lastConstructedConfig.onError).toBeUndefined();
  });

  it("useDefaultSettings sets defaults and locks fields", () => {
    const b = ApiClientBuilder.create("https://a").useDefaultSettings();
    expect(() => b.withTimeout(1)).toThrow(/locked/i);
    expect(() => b.withTokenFailureMode("throw")).toThrow(/locked/i);
    b.build();
    expect(lastConstructedConfig.timeoutMs).toBe(15000);
    expect(lastConstructedConfig.tokenFailureMode).toBe("silent");
  });


  it("fromConfiguration merges headers and validates baseUrl; forbids overriding locked fields", () => {
    const b = ApiClientBuilder.create("https://a")
      .withDefaultHeaders({ A: "1" })
      .useDefaultSettings();
    expect(() => b.fromConfiguration({ timeoutMs: 1 } as any)).toThrow(
      /cannot override locked options/i
    );
    const b2 = ApiClientBuilder.create("https://a")
      .withDefaultHeaders({ A: "1" })
      .fromConfiguration({ baseUrl: "https://b", defaultHeaders: { B: "2" } });
    b2.build();
    expect(lastConstructedConfig.baseUrl).toBe(new URL("https://b").toString());
    expect(lastConstructedConfig.defaultHeaders).toEqual({ A: "1", B: "2" });
  });

  it("build() cannot be called twice", () => {
    const b = ApiClientBuilder.create("https://a");
    b.build();
    expect(() => b.build()).toThrow(/already built/i);
  });
});

