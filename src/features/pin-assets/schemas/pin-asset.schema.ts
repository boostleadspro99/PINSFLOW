import { z } from "zod";
import { PinAssetStatus } from "@prisma/client";

export const generatePinAssetSchema = z.object({
  pinDraftId: z.string().min(1),
  projectId: z.string().min(1),
  width: z.number().int().positive().default(1000),
  height: z.number().int().positive().default(1500),
});

export const attachPinAssetUrlSchema = z.object({
  pinDraftId: z.string().min(1),
  projectId: z.string().min(1),
  imageUrl: z.string().url(),
});

export const archivePinAssetSchema = z.object({
  pinAssetId: z.string().min(1),
  projectId: z.string().min(1),
});
