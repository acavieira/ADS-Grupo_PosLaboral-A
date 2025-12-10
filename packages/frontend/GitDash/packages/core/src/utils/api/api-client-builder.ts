import type { AxiosRequestHeaders } from "axios";
import { ApiClient } from "./api-client";
import type { ApiClientConfig } from "./config/api-client-config";
import { ApiError } from "./types/api-error";
import type { ILoggerBase } from '../logger/types/logger-base'

type ApiKey = keyof ApiClientConfig;

export class ApiClientBuilder {
  private cfg: ApiClientConfig;
  private built = false;
  private lockedFields: Map<ApiKey, string> = new Map();

  private constructor(baseUrl: string) {
    this.cfg = {
      baseUrl: ApiClientBuilder.ensureUrl(baseUrl),
      timeoutMs: 15000,
      defaultHeaders: {},
      tokenFailureMode: "silent",
      clientName: "api-client",
      withCredentials: false,
    };
  }

  static create(baseUrl: string): ApiClientBuilder {
    if (!baseUrl?.trim()) throw new Error("ApiClientBuilder: baseUrl is required");
    return new ApiClientBuilder(baseUrl);
  }

  private ensureNotLocked(method: string, ...keys: ApiKey[]) {
    for (const k of keys) {
      if (this.lockedFields.has(k)) {
        const reason = this.lockedFields.get(k);
        throw new Error(
          `${method}(): option "${String(k)}" is locked${reason ? ` (${reason})` : ""} and cannot be overridden`
        );
      }
    }
  }

  private lockByPreset(reason: string, ...keys: ApiKey[]) {
    for (const k of keys) this.lockedFields.set(k, reason);
  }

  private static ensureUrl(url: string): string {
    try {
      return new URL(url).toString();
    } catch {
      throw new Error(`ApiClientBuilder: invalid baseUrl "${url}"`);
    }
  }

  private sanitizeHeaders(
    obj: Record<string, string | number | boolean> | undefined
  ): AxiosRequestHeaders | undefined {
    if (!obj) return undefined;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (!k) continue;
      if (v === undefined || v === null) continue;
      out[k] = String(v);
    }
    return out as AxiosRequestHeaders;
  }

  private assertNotBuilt(method: string) {
    if (this.built) throw new Error(`ApiClientBuilder.${method}(): builder is already built`);
  }

  withBaseUrl(url: string): this {
    this.assertNotBuilt("withBaseUrl");
    this.ensureNotLocked("withBaseUrl", "baseUrl");
    this.cfg.baseUrl = ApiClientBuilder.ensureUrl(url);
    return this;
  }

  withTimeout(ms: number): this {
    this.assertNotBuilt("withTimeout");
    this.ensureNotLocked("withTimeout", "timeoutMs");
    if (!(ms > 0)) throw new Error("withTimeout: ms must be > 0");
    this.cfg.timeoutMs = Math.floor(ms);
    return this;
  }

  withRetryPolicy(maxRetries: number): this {
    this.assertNotBuilt("withRetryPolicy");
    this.ensureNotLocked("withRetryPolicy", "maxRetries");
    if (!(maxRetries >= 0)) throw new Error("maxRetries must be >= 0");
    this.cfg.maxRetries = Math.floor(maxRetries); // Save to config
    return this;
  }

  withDefaultHeaders(headers: Record<string, string | number | boolean>): this {
    this.assertNotBuilt("withDefaultHeaders");
    this.ensureNotLocked("withDefaultHeaders", "defaultHeaders");
    this.cfg.defaultHeaders = {
      ...(this.cfg.defaultHeaders ?? {}),
      ...Object.fromEntries(
        Object.entries(headers ?? {})
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      ),
    };
    return this;
  }

  withHeader(name: string, value: string | number | boolean): this {
    this.assertNotBuilt("withHeader");
    this.ensureNotLocked("withHeader", "defaultHeaders");
    if (!name?.trim()) throw new Error("withHeader: name is required");
    if (value === undefined || value === null) return this;
    this.cfg.defaultHeaders = { ...(this.cfg.defaultHeaders ?? {}), [name]: String(value) };
    return this;
  }

  withTokenProvider(getToken: () => Promise<string | null>): this {
    this.assertNotBuilt("withTokenProvider");
    this.ensureNotLocked("withTokenProvider", "getToken");
    this.cfg.getToken = getToken;
    return this;
  }

  withTokenFailureMode(mode: "silent" | "throw"): this {
    this.assertNotBuilt("withTokenFailureMode");
    this.ensureNotLocked("withTokenFailureMode", "tokenFailureMode");
    this.cfg.tokenFailureMode = mode;
    return this;
  }


  withLogger(logger: ILoggerBase | null | undefined): this {
    this.assertNotBuilt("withLogger");
    this.ensureNotLocked("withLogger", "logger");
    this.cfg.logger = logger ?? undefined;
    return this;
  }

  withClientName(name: string): this {
    this.assertNotBuilt("withClientName");
    this.ensureNotLocked("withClientName", "clientName");
    if (!name?.trim()) throw new Error("withClientName: name is required");
    this.cfg.clientName = name;
    return this;
  }

  withCredentials(enabled: boolean): this {
    this.assertNotBuilt("withCredentials");
    this.ensureNotLocked("withCredentials", "withCredentials");
    this.cfg.withCredentials = enabled;
    return this;
  }

  onAnyError(handler: (err: unknown) => void): this {
    this.assertNotBuilt("onAnyError");
    this.ensureNotLocked("onAnyError", "onError");
    this.cfg.onError = (e: ApiError) => {
      handler(e);
    };
    return this;
  }

  onUnauthorized(handler: (err: unknown) => void): this {
    this.assertNotBuilt("onUnauthorized");
    this.ensureNotLocked("onUnauthorized", "onUnauthorized");
    this.cfg.onUnauthorized = (e: ApiError) => {
      handler(e);
    };
    return this;
  }

  useDefaultSettings(): this {
    this.withTimeout(15000);
    this.withTokenFailureMode("silent");

    this.lockByPreset(
      "locked by useDefaultSettings()",
      "timeoutMs",
      "tokenFailureMode"
    );
    return this;
  }


  fromConfiguration(overrides: Partial<ApiClientConfig>): this {
    const keys = Object.keys(overrides ?? {}) as ApiKey[];
    const locked = keys.filter((k) => this.lockedFields.has(k));
    if (locked.length) {
      const details = locked
        .map(
          (k) =>
            `"${String(k)}"${this.lockedFields.get(k) ? ` (${this.lockedFields.get(k)})` : ""}`
        )
        .join(", ");
      throw new Error(`fromConfiguration(): cannot override locked options: ${details}`);
    }

    const baseUrl =
      overrides.baseUrl !== undefined
        ? ApiClientBuilder.ensureUrl(overrides.baseUrl)
        : this.cfg.baseUrl;

    this.cfg = {
      ...this.cfg,
      ...overrides,
      baseUrl,
      defaultHeaders: {
        ...(this.cfg.defaultHeaders ?? {}),
        ...(overrides.defaultHeaders ?? {}),
      },
    };

    return this;
  }

  build(): ApiClient {
    this.assertNotBuilt("build");
    this.built = true;

    if (!this.cfg.baseUrl?.trim()) {
      throw new Error("ApiClientBuilder: baseUrl is required");
    }

    const finalConfig: ApiClientConfig = {
      baseUrl: this.cfg.baseUrl,
      getToken: this.cfg.getToken,
      tokenFailureMode: this.cfg.tokenFailureMode ?? "silent",
      onError: this.cfg.onError,
      onUnauthorized: this.cfg.onUnauthorized,
      logger: this.cfg.logger,
      timeoutMs: this.cfg.timeoutMs ?? 15000,
      clientName: this.cfg.clientName ?? "api-client",
      defaultHeaders: this.sanitizeHeaders(this.cfg.defaultHeaders) as AxiosRequestHeaders,
      withCredentials: this.cfg.withCredentials,
      maxRetries: this.cfg.maxRetries,
    };

    return new ApiClient(finalConfig);
  }
}

