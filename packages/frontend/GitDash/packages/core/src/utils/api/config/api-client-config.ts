import type { ApiError } from "../types/api-error";
import type { ILoggerBase } from '../../logger/types/logger-base'

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => Promise<string | null>;
  defaultHeaders?: Record<string, string>;
  tokenFailureMode?: "silent" | "throw";
  onError?: (err: ApiError) => void;
  onUnauthorized?: (err: ApiError) => void;
  timeoutMs?: number;
  logger?: ILoggerBase;
  clientName?: string;
  maxRetries?: number;
  withCredentials?: boolean;
}

