import { z } from "zod";
import { ContentIdeaStatus, ContentIdeaFormat } from "@prisma/client";

export const generateContentIdeasSchema = z.object({
  projectId: z.string().cuid("Invalid project ID"),
  keywordId: z.string().cuid("Invalid keyword ID"),
  count: z.number().int().min(1).max(10).default(5),
});

export const updateContentIdeaStatusSchema = z.object({
  projectId: z.string().cuid("Invalid project ID"),
  ideaId: z.string().cuid("Invalid idea ID"),
  status: z.nativeEnum(ContentIdeaStatus),
});

export type GenerateContentIdeasInput = z.infer<typeof generateContentIdeasSchema>;
export type UpdateContentIdeaStatusInput = z.infer<typeof updateContentIdeaStatusSchema>;
