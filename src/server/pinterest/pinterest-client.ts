import { env } from "@/lib/env";
import { pinterestConfig } from "@/config/pinterest";
import { PinterestApiError, PinterestRateLimitError } from "./pinterest.errors";

interface ApiClientOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken: string;
}

export async function pinterestApiFetch<T>(
  path: string,
  options: ApiClientOptions,
): Promise<T> {
  const { method = "GET", body, accessToken } = options;
  const baseUrl = env.PINTEREST_API_BASE_URL || pinterestConfig.apiBaseUrl;
  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new PinterestApiError("Failed to reach Pinterest API");
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    throw new PinterestRateLimitError(retryAfter ? parseInt(retryAfter, 10) : undefined);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.message || `Pinterest API error (${response.status})`;
    throw new PinterestApiError(message, response.status);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
