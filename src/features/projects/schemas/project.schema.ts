import { z } from "zod";
import { ProjectStatus } from "@prisma/client";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80, "Name must be at most 80 characters"),
  description: z.string().max(500, "Description must be at most 500 characters").optional().nullable(),
  language: z.string().min(2).max(10).default("en"),
  country: z.string().min(2).max(10).default("US"),
  targetAudience: z.string().max(200, "Target audience must be at most 200 characters").optional().nullable(),
  defaultWebsiteUrl: z.union([z.literal(""), z.string().url("Must be a valid URL")]).optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.extend({
  status: z.nativeEnum(ProjectStatus).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
