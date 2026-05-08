import { z } from "zod";

export const pinterestOAuthCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().min(1, "State parameter is required"),
});

export type PinterestOAuthCallbackInput = z.infer<typeof pinterestOAuthCallbackSchema>;

export const syncPinterestBoardsSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
});

export type SyncPinterestBoardsInput = z.infer<typeof syncPinterestBoardsSchema>;

export const disconnectPinterestSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
});

export type DisconnectPinterestInput = z.infer<typeof disconnectPinterestSchema>;
