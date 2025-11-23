import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosRequestHeaders,
  AxiosStatic,
} from "axios";
import { RequestMetadata } from './types/request-metadata'
import { ApiError } from './types/api-error'
import { ILoggerBase } from '../logger/types/logger-base'
import { ApiClientConfig } from './config/api-client-config'
import { ProblemDetails } from './types/problem-details'
import axiosRetry from 'axios-retry';

// Utility to generate a unique ID
const genSpanId = (): string => Math.random().toString(36).substring(2, 9);

// Extend AxiosRequestConfig to include our custom metadata
declare module "axios" {
  interface AxiosRequestConfig {
    __metadata?: RequestMetadata;
  }
}

export class ApiClient {
  private readonly axiosInstance: AxiosInstance;
  private readonly getToken?: () => Promise<string | null>;
  private readonly tokenFailureMode: "silent" | "throw";
  private readonly onError?: (err: ApiError) => void;
  private readonly onUnauthorized?: (err: ApiError) => void;
  private readonly logger?: ILoggerBase;
  private readonly clientName: string;

  constructor(config: ApiClientConfig) {
    this.getToken = config.getToken;
    this.tokenFailureMode = config.tokenFailureMode ?? "silent";
    this.onError = config.onError;
    this.onUnauthorized = config.onUnauthorized;
    this.logger = config.logger;
    this.clientName = config.clientName ?? "api-client";

    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: config.defaultHeaders || {},
      timeout: config.timeoutMs ?? 15000,
      withCredentials: config.withCredentials ?? false,
    });

    this.axiosInstance.interceptors.request.use(async (request) => {
      // --- Token Retrieval Logic ---
      if (this.getToken) {
        try {
          const token = await this.getToken();
          if (token) {
            request.headers = (request.headers ?? {}) as AxiosRequestHeaders;
            request.headers["Authorization"] = `Bearer ${token}`;
          }
        } catch (err) {
          if (this.tokenFailureMode === "throw") {
            throw new ApiError(
              {
                title: "Authorization failed",
                status: 401,
                detail: err instanceof Error ? err.message : String(err),
              },
              401
            );
          }
        }
      }

      // --- Metadata Attachment ---
      const depId = genSpanId();
      const startedAt =
        typeof performance !== "undefined" && performance.now
          ? performance.now()
          : Date.now();
      const method = (request.method ?? "get").toUpperCase();
      const base = request.baseURL ?? this.axiosInstance.defaults.baseURL ?? "";
      const path = request.url ?? "";
      const url = new URL(path, base || config.baseUrl);

      request.__metadata = {
        depId,
        startedAt,
        method,
        url,
        href: url.href,
      } as RequestMetadata;

      this.logger?.debug("api.request", {
        depId,
        method,
        url: url.href,
      });

      return request;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => {
        const meta = response.config.__metadata as RequestMetadata | undefined;
        if (meta) {
          const finishedAt =
            typeof performance !== "undefined" && performance.now
              ? performance.now()
              : Date.now();
          const durationMs = Math.max(0, Math.round(finishedAt - meta.startedAt));
          const status = response.status ?? 0;

          this.logger?.info("api.response", {
            depId: meta.depId,
            method: meta.method,
            url: meta.url.href,
            status,
            durationMs,
          });
        }

        return response;
      },
      (error) => this.handleError(error)
    );

    if (config.maxRetries && config.maxRetries > 0) {
      axiosRetry(this.axiosInstance, {
        retries: config.maxRetries,
        // Define which status codes should trigger a retry
        retryCondition: (error) => {
          return axiosRetry.isNetworkError(error) ||
            error.response?.status === 429 || // Too Many Requests
            error.response?.status === 503; // Service Unavailable
        },
        retryDelay: axiosRetry.exponentialDelay,
      });
    }
  }

  // --- Public HTTP Methods  ---
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.get<T>(url, config);
    return res.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.post<T>(url, data, config);
    return res.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.put<T>(url, data, config);
    return res.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.patch<T>(url, data, config);
    return res.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.axiosInstance.delete<T>(url, config);
    return res.data;
  }

  private handleError(error: unknown): never {
    const meta = axios.isAxiosError(error) ? error.config?.__metadata : undefined;
    const finishedAt =
      typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    const durationMs = meta ? Math.max(0, Math.round(finishedAt - meta.startedAt)) : undefined;

    if (axios.isAxiosError(error)) {
      const ax = error as AxiosError<Partial<ProblemDetails> | undefined>;

      if (ax.response) {
        const status = ax.response.status ?? 0;
        const data = ax.response.data;

        // --- Problem Details Construction ---
        const problem: ProblemDetails =
          data && typeof data === "object"
            ? {
              type: data.type,
              title: data.title ?? this.statusTitle(status),
              status: data.status ?? status,
              detail: data.detail ?? (ax.message || "Request failed"),
              instance: data.instance,
              ...data,
            }
            : {
              title: this.statusTitle(status),
              status,
              detail: ax.message || "Request failed",
            };

        const requestId =
          this.pickHeader(ax.response.headers, "request-id") ??
          this.pickHeader(ax.response.headers, "x-request-id") ??
          this.pickHeader(ax.response.headers, "x-ms-request-id");

        const retryable = this.isRetryableStatus(status);

        this.logger?.error("api.response.error", {
          error: ax,
          status,
          requestId,
          retryable,
          durationMs,
          method: meta?.method,
          url: meta?.url.href,
        });

        // --- ApiError Instantiation ---
        const apiErr = new ApiError(problem, status, {
          isNetworkError: false,
          retryable,
          requestId,
        });

        if (status === 401) this.onUnauthorized?.(apiErr);
        this.onError?.(apiErr);
        throw apiErr;
      }

      // --- Network Error Handling  ---
      const isTimeout = ax.code === "ECONNABORTED";
      const apiErr = new ApiError(
        {
          title: isTimeout ? "Request timeout" : "Network error",
          status: 0,
          detail: ax.message || "No response from server",
        },
        0,
        { isNetworkError: true, retryable: true }
      );


      this.logger?.error("api.response.network_error", {
        error: ax,
        durationMs,
        method: meta?.method,
        url: meta?.url?.href,
      });

      this.onError?.(apiErr);
      throw apiErr;
    }

    // --- Unexpected Error Handling  ---
    const apiErr = new ApiError(
      {
        title: "Unexpected error",
        status: 500,
        detail: error instanceof Error ? error.message : String(error),
      },
      500,
      { retryable: false }
    );

    this.logger?.error("api.unexpected_error", {
      error,
      durationMs,
      method: meta?.method,
      url: meta?.url?.href,
    });

    this.onError?.(apiErr);
    throw apiErr;
  }

  // --- Private Helper Methods  ---
  private pickHeader(headers: unknown, name: string): string | undefined {
    const v = (headers as Record<string, unknown> | undefined)?.[name];
    if (Array.isArray(v)) return typeof v[0] === "string" ? v[0] : undefined;
    return typeof v === "string" ? v : undefined;
  }

  private isAxiosError(err: unknown): err is AxiosError {
    return !!(axios as AxiosStatic).isAxiosError?.(err);
  }

  private statusTitle(status: number): string {
    switch (status) {
      case 400: return "Bad Request";
      case 401: return "Unauthorized";
      case 403: return "Forbidden";
      case 404: return "Not Found";
      case 409: return "Conflict";
      case 422: return "Unprocessable Entity";
      case 429: return "Too Many Requests";
      case 500: return "Internal Server Error";
      case 502: return "Bad Gateway";
      case 503: return "Service Unavailable";
      case 504: return "Gateway Timeout";
      default: return `HTTP ${status}`;
    }
  }

  private isRetryableStatus(status: number): boolean {
    if (status === 408 || status === 429) return true;
    return status >= 500 && status !== 501 && status !== 505;

  }
}
