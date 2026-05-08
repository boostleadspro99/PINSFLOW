import type { PinterestAccountStatus } from "@prisma/client";

export interface PinterestAccountWithBoards {
  id: string;
  userId: string;
  pinterestUserId: string;
  username: string;
  displayName: string | null;
  accountType: string | null;
  scopes: string;
  status: PinterestAccountStatus;
  createdAt: Date;
  updatedAt: Date;
  boards: PinterestBoardItem[];
}

export interface PinterestBoardItem {
  id: string;
  pinterestBoardId: string;
  name: string;
  description: string | null;
  url: string | null;
  privacy: string | null;
  ownerUsername: string | null;
  lastSyncedAt: Date | null;
  createdAt: Date;
}
