"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { keywordService } from "../services/keyword.service";
import { createKeywordSchema, importKeywordsSchema, updateKeywordStatusSchema, CreateKeywordInput, ImportKeywordsInput, UpdateKeywordStatusInput } from "../schemas/keyword.schema";
import { parseKeywordsImport } from "../utils/keyword-parser";

export async function createKeywordAction(data: CreateKeywordInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const parsed = createKeywordSchema.safeParse(data);
    if (!parsed.success) return { error: "Invalid data", details: parsed.error.flatten() };

    const keyword = await keywordService.create(session.user.id, parsed.data);
    revalidatePath(`/dashboard/projects/${data.projectId}/keywords`);
    return { success: true, keyword };
  } catch (error: any) {
    console.error("Create keyword error:", error);
    return { error: error.message || "Failed to create keyword" };
  }
}

export async function importKeywordsAction(data: ImportKeywordsInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const parsed = importKeywordsSchema.safeParse(data);
    if (!parsed.success) return { error: "Invalid data", details: parsed.error.flatten() };

    const { terms, skipped } = parseKeywordsImport(parsed.data.text);
    
    if (terms.length === 0) {
      return { error: "No valid keywords found to import" };
    }

    const result = await keywordService.importBulk(session.user.id, parsed.data.projectId, terms);
    revalidatePath(`/dashboard/projects/${data.projectId}/keywords`);
    return { 
      success: true, 
      added: result.addedCount, 
      duplicates: result.duplicateCount,
      skipped
    };
  } catch (error: any) {
    console.error("Import keywords error:", error);
    return { error: error.message || "Failed to import keywords" };
  }
}

export async function updateKeywordStatusAction(data: UpdateKeywordStatusInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const parsed = updateKeywordStatusSchema.safeParse(data);
    if (!parsed.success) return { error: "Invalid data", details: parsed.error.flatten() };

    const keyword = await keywordService.updateStatus(session.user.id, parsed.data);
    revalidatePath(`/dashboard/projects/${data.projectId}/keywords`);
    return { success: true, keyword };
  } catch (error: any) {
    console.error("Update keyword status error:", error);
    return { error: error.message || "Failed to update keyword status" };
  }
}
