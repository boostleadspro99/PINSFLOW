import { z } from "zod";
import { PublishProvider } from "@prisma/client";

export const publishSchema = z.object({
  pinDraftId: z.string().min(1, "Pin draft is required"),
  pinAssetId: z.string().min(1, "Image asset is required"),
  projectId: z.string().min(1, "Project is required"),
  boardId: z.string().min(1, "Board ID is required"),
  boardName: z.string().optional().nullable(),
  title: z.string().min(1).max(140),
  description: z.string().min(1).max(500),
  imageUrl: z.string().url("Image URL must be valid"),
  targetUrl: z.string().url().optional().nullable(),
  provider: z.nativeEnum(PublishProvider).optional().default(PublishProvider.DIRECT_PINTEREST),
});

export type PublishInput = z.infer<typeof publishSchema>;
