import { z } from "zod";

export const pinDraftSchema = z.object({
  title: z.string().min(1).max(140),
  description: z.string().min(1).max(500),
  overlayText: z.string().max(200).optional().nullable(),
  imagePrompt: z.string().min(1),
  hashtags: z.string().max(500).optional().nullable(),
  targetUrl: z.string().url().optional().nullable(),
  qualityScore: z.number().int().min(0).max(100).default(0),
});

export type PinDraftInput = z.infer<typeof pinDraftSchema>;
