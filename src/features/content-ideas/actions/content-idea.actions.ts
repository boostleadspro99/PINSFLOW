"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateContentIdeasSchema, updateContentIdeaStatusSchema, GenerateContentIdeasInput, UpdateContentIdeaStatusInput } from "../schemas/content-idea.schema";
import { getAiClient, resolveModelForTask } from "@/server/ai/ai-client";
import { AITaskType } from "@prisma/client";
import { contentIdeaService } from "../services/content-idea.service";

export async function generateContentIdeasAction(data: GenerateContentIdeasInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const parsed = generateContentIdeasSchema.safeParse(data);
    if (!parsed.success) return { error: "Invalid input data", details: parsed.error.flatten() };

    const { projectId, keywordId, count } = parsed.data;

    // Verify ownership and get context
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id }
    });

    if (!project) return { error: "Project not found or unauthorized" };

    const keyword = await prisma.keyword.findFirst({
      where: { id: keywordId, projectId }
    });

    if (!keyword) return { error: "Keyword not found in this project" };

    // Resolve model from project AI settings
    const resolved = await resolveModelForTask(projectId, AITaskType.CONTENT_IDEAS);
    const aiClient = resolved.provider;

    // Call AI Provider
    const generatedIdeas = await aiClient.generateContentIdeas({
      projectName: project.name,
      projectDescription: project.description,
      targetAudience: project.targetAudience,
      keyword: keyword.term,
      count,
    });

    if (!generatedIdeas || generatedIdeas.length === 0) {
       return { error: "AI returned no ideas. Please try again." };
    }

    // Save ideas
    await contentIdeaService.saveGeneratedIdeas(projectId, keywordId, generatedIdeas);

    revalidatePath(`/dashboard/projects/${projectId}/ideas`);
    revalidatePath(`/dashboard/projects/${projectId}/keywords`);

    return { success: true, count: generatedIdeas.length, modelKey: resolved.modelKey };
  } catch (error: any) {
    console.error("Generate content ideas error:", error);
    return { error: error.message || "Failed to generate content ideas" };
  }
}

export async function updateContentIdeaStatusAction(data: UpdateContentIdeaStatusInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const parsed = updateContentIdeaStatusSchema.safeParse(data);
    if (!parsed.success) return { error: "Invalid data", details: parsed.error.flatten() };

    const idea = await contentIdeaService.updateStatus(session.user.id, parsed.data);
    revalidatePath(`/dashboard/projects/${data.projectId}/ideas`);

    return { success: true, idea };
  } catch (error: any) {
    console.error("Update content idea status error:", error);
    return { error: error.message || "Failed to update content idea status" };
  }
}
