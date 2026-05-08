import { z } from "zod";
import { KeywordStatus, KeywordSource } from "@prisma/client";

export const createKeywordSchema = z.object({
  projectId: z.string().cuid("Invalid project ID"),
  term: z.string().min(1, "Term is required").max(100, "Term is too long"),
  searchVolume: z.number().int().nonnegative().optional().nullable(),
  difficulty: z.number().int().min(0).max(100).optional().nullable(),
});

export const updateKeywordStatusSchema = z.object({
  keywordId: z.string().cuid("Invalid keyword ID"),
  projectId: z.string().cuid("Invalid project ID"),
  status: z.nativeEnum(KeywordStatus),
});

export const importKeywordsSchema = z.object({
  projectId: z.string().cuid("Invalid project ID"),
  text: z.string().min(1, "Input text is required"),
});

export type CreateKeywordInput = z.infer<typeof createKeywordSchema>;
export type UpdateKeywordStatusInput = z.infer<typeof updateKeywordStatusSchema>;
export type ImportKeywordsInput = z.infer<typeof importKeywordsSchema>;
