"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createProjectSchema, updateProjectSchema, CreateProjectInput, UpdateProjectInput } from "../schemas/project.schema";
import { projectService } from "../services/project.service";

export async function createProjectAction(data: CreateProjectInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const parsed = createProjectSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Invalid data", details: parsed.error.flatten() };
    }

    const project = await projectService.create(session.user.id, parsed.data);
    revalidatePath("/dashboard/projects");
    return { success: true, project };
  } catch (error) {
    console.error("Create project error:", error);
    return { error: "Failed to create project" };
  }
}

export async function updateProjectAction(projectId: string, data: UpdateProjectInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const parsed = updateProjectSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Invalid data", details: parsed.error.flatten() };
    }

    const project = await projectService.update(session.user.id, projectId, parsed.data);
    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true, project };
  } catch (error) {
    console.error("Update project error:", error);
    return { error: "Failed to update project" };
  }
}

export async function archiveProjectAction(projectId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    await projectService.archive(session.user.id, projectId);
    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Archive project error:", error);
    return { error: "Failed to archive project" };
  }
}
