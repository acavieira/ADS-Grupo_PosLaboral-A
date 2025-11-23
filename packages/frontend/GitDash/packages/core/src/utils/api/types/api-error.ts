import { ProblemDetails } from "./problem-details";

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails;
  readonly isNetworkError: boolean;
  readonly retryable: boolean;
  readonly requestId?: string;

  constructor(
    problem: ProblemDetails,
    status: number,
    opts?: { isNetworkError?: boolean; retryable?: boolean; requestId?: string }
  ) {
    super(problem.title || "API Error");
    this.status = status;
    this.problem = problem;
    this.isNetworkError = !!opts?.isNetworkError;
    this.retryable = !!opts?.retryable;
    this.requestId = opts?.requestId;
  }
}

