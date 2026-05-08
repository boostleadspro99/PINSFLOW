// Pinterest API v5 response types
// Based on https://developers.pinterest.com/api/v5/

export interface PinterestTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}

export interface PinterestUserAccount {
  username: string;
  account_type: "BUSINESS" | "INDIVIDUAL" | "UNKNOWN";
  profile_image?: string;
  website_url?: string;
  id: string;
}

export interface PinterestBoardResponse {
  id: string;
  name: string;
  description: string | null;
  owner: { username: string };
  privacy: "PUBLIC" | "PROTECTED" | "SECRET";
  url: string;
  created_at: string;
  updated_at: string;
}

export interface PinterestBoardsListResponse {
  items: PinterestBoardResponse[];
  bookmark: string | null;
}

export interface PinterestErrorResponse {
  code: number;
  message: string;
  status: string;
}
