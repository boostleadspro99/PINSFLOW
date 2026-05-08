import { pinterestConfig } from "@/config/pinterest";

export function formatScopesForStorage(scopes: string[]): string {
  return scopes.join(",");
}

export function parseStoredScopes(scopes: string): string[] {
  return scopes.split(/[,\s]+/).filter(Boolean);
}

export function getScopeLabel(scope: string): string {
  const labels: Record<string, string> = {
    "boards:read": "Read boards",
    "boards:write": "Write boards",
    "pins:read": "Read pins",
    "pins:write": "Write pins",
    "user_accounts:read": "Read account info",
  };
  return labels[scope] || scope;
}

export function getRequestedScopes(): string[] {
  return pinterestConfig.scopes;
}
