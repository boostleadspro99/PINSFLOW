export class PinterestApiError extends Error {
  public statusCode: number;
  public pinterestCode?: number;
  public pinterestStatus?: string;

  constructor(message: string, statusCode = 500, pinterestCode?: number, pinterestStatus?: string) {
    super(message);
    this.name = "PinterestApiError";
    this.statusCode = statusCode;
    this.pinterestCode = pinterestCode;
    this.pinterestStatus = pinterestStatus;
  }
}

export class PinterestAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PinterestAuthError";
  }
}

export class PinterestRateLimitError extends Error {
  public retryAfter?: number;

  constructor(retryAfter?: number) {
    super("Pinterest API rate limit exceeded. Please try again later.");
    this.name = "PinterestRateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class PinterestTokenError extends Error {
  constructor(message = "Pinterest token is invalid or expired. Please reconnect your account.") {
    super(message);
    this.name = "PinterestTokenError";
  }
}
