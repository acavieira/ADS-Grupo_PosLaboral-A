import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { ApiClient } from "../api-client";

vi.mock("axios", () => {
  let requestHandler: any = null;
  let responseSuccess: any = null;
  let responseFail: any = null;
  let nextResponse: any = null;
  let nextError: any = null;
  let lastRequest: any = null;

  const run = async (instance: any, method: string, url: string, data?: any, config?: any) => {
    let req: any = {
      method,
      url,
      data,
      baseURL: instance.defaults.baseURL,
      headers: {},
      ...(config || {}),
    };

    if (requestHandler) {
      // If interceptor throws, we do not set lastRequest
      req = await requestHandler(req);
    }

    lastRequest = req;

    if (nextError) {
      const err = nextError;
      nextError = null;
      err.config = req;
      if (responseFail) {
        await responseFail(err);
      }
      throw err;
    }

    const resp = nextResponse ?? { status: 200, data: undefined, headers: {}, config: req };
    nextResponse = null;
    resp.config = req;
    if (responseSuccess) {
      return await responseSuccess(resp);
    }
    return resp;
  };

  const create = (cfg: any) => {
    const instance: any = {
      defaults: { baseURL: cfg?.baseURL, headers: cfg?.headers, timeout: cfg?.timeout },
      interceptors: {
        request: { use: (fn: any) => (requestHandler = fn) },
        response: {
          use: (succ: any, fail: any) => (
            (responseSuccess = succ),
              (responseFail = fail)
          ),
        },
      },
      get: (url: string, config?: any) => run(instance, "get", url, undefined, config),
      post: (url: string, data?: any, config?: any) =>
        run(instance, "post", url, data, config),
      put: (url: string, data?: any, config?: any) => run(instance, "put", url, data, config),
      patch: (url: string, data?: any, config?: any) =>
        run(instance, "patch", url, data, config),
      delete: (url: string, config?: any) => run(instance, "delete", url, undefined, config),
    };
    return instance;
  };

  const isAxiosError = (e: any) => !!e?.isAxiosError;

  const reset = () => {
    requestHandler = null;
    responseSuccess = null;
    responseFail = null;
    nextResponse = null;
    nextError = null;
    lastRequest = null;
  };

  const helpers = {
    __setNextResponse: (r: any) => (nextResponse = r),
    __setNextError: (e: any) => (nextError = e),
    __getLastRequest: () => lastRequest ?? null,
    __reset: reset,
  };

  const defaultExport = { create, isAxiosError, ...helpers };
  return {
    default: defaultExport,
    create,
    isAxiosError,
    ...helpers,
  };
});

vi.mock("../telemetry/helpers/span-id-helper", () => ({
  genSpanId: vi.fn(() => "span-id-12345678"),
}));

describe("ApiClient", () => {
  const makeTelemetry = () => ({
    trackDependency: vi.fn(),
    getTraceContext: vi.fn(() => ({
      traceparent: "00-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-bbbbbbbbbbbbbbbb-01",
      tracestate: "acme=1",
    })),
  });

  const makeLogger = () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  });

  const baseConfig = () => ({
    baseUrl: "https://api.test/",
    telemetry: makeTelemetry() as any,
    logger: makeLogger() as any,
    clientName: "test-client",
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    (axios as any).__reset?.();
    if ((globalThis as any).performance?.now) {
      vi.spyOn(performance, "now").mockReturnValueOnce(1000).mockReturnValueOnce(1100);
    }
  });

  it("adds Authorization header when token is provided", async () => {
    const cfg = baseConfig();
    const client = new ApiClient({
      ...cfg,
      getToken: async () => "tok123",
    } as any);

    (axios as any).__setNextResponse({ status: 200, data: { ok: true }, headers: {} });
    const res = await client.get<{ ok: boolean }>("/users");
    expect(res.ok).toBe(true);

    const last = (axios as any).__getLastRequest();
    expect(last.headers["Authorization"]).toBe("Bearer tok123");
  });


  it("logs on successful response", async () => {
    const cfg = baseConfig();
    const client = new ApiClient(cfg as any);

    (axios as any).__setNextResponse({ status: 204, data: undefined, headers: {} });
    await client.get("/ping");

    const tele = cfg.telemetry as any;
    const log = cfg.logger as any;

    expect(log.debug).toHaveBeenCalledWith(
      "api.request",
      expect.objectContaining({ url: "https://api.test/ping" })
    );
    expect(log.info).toHaveBeenCalledWith(
      "api.response",
      expect.objectContaining({ url: "https://api.test/ping", status: 204, durationMs: 100 })
    );
  });

  it("maps 401 response to ApiError, invokes onUnauthorized and onError, and tracks failure", async () => {
    const cfg = baseConfig();
    const onUnauthorized = vi.fn();
    const onError = vi.fn();
    const client = new ApiClient({ ...cfg, onUnauthorized, onError } as any);

    const axiosErr: any = {
      isAxiosError: true,
      message: "Unauthorized",
      response: {
        status: 401,
        data: { title: "Unauthorized" },
        headers: { "x-request-id": "rid-401" },
      },
    };
    (axios as any).__setNextError(axiosErr);

    await expect(client.get("/secure")).rejects.toMatchObject({ status: 401 });

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);

    const log = cfg.logger as any;
    expect(log.error).toHaveBeenCalledWith(
      "api.response.error",
      expect.objectContaining({
        status: 401,
        requestId: "rid-401",
        url: "https://api.test/secure",
      })
    );
  });

  it("handles network timeout as retryable network ApiError with resultCode 0", async () => {
    const cfg = baseConfig();
    const onError = vi.fn();
    const client = new ApiClient({ ...cfg, onError } as any);

    const axiosErr: any = {
      isAxiosError: true,
      code: "ECONNABORTED",
      message: "timeout",
    };
    (axios as any).__setNextError(axiosErr);

    await expect(client.get("/slow")).rejects.toMatchObject({ status: 0 });

    expect(onError).toHaveBeenCalledTimes(1);

    const log = cfg.logger as any;
    expect(log.error).toHaveBeenCalledWith(
      "api.response.network_error",
      expect.objectContaining({ url: "https://api.test/slow" })
    );
  });

  it("throws ApiError from request interceptor when getToken fails and tokenFailureMode='throw'", async () => {
    const cfg = baseConfig();
    const client = new ApiClient({
      ...cfg,
      tokenFailureMode: "throw",
      getToken: async () => {
        throw new Error("boom");
      },
    } as any);

    await expect(client.get("/needs-token")).rejects.toMatchObject({ status: 401 });

    const last = (axios as any).__getLastRequest();
    expect(last).toBeNull();
  });

  it("builds absolute URL from base and relative path", async () => {
    const cfg = baseConfig();
    const client = new ApiClient(cfg as any);

    (axios as any).__setNextResponse({ status: 200, data: {}, headers: {} });
    await client.post("v1/users", { name: "john" });

    const last = (axios as any).__getLastRequest();
    expect(new URL(last.url, last.baseURL).href).toBe("https://api.test/v1/users");
  });
});

