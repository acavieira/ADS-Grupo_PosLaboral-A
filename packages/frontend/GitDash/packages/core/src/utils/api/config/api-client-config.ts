import { ApiError } from "../types/api-error";
import { ILoggerBase } from '../../logger/types/logger-base'

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

