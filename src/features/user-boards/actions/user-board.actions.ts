"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBoardSchema, deleteBoardSchema } from "../schemas/user-board.schema";
import type { CreateBoardInput, DeleteBoardInput } from "../schemas/user-board.schema";

export async function createBoardAction(data: CreateBoardInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const parsed = createBoardSchema.safeParse(data);
    if (!parsed.success) return { error: "Invalid data", details: parsed.error.flatten() };

    const board = await prisma.userBoard.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        boardId: parsed.data.boardId,
        boardUrl: parsed.data.boardUrl || null,
      },
    });

    revalidatePath("/dashboard/settings/boards");
    return { success: true, board };
  } catch (error: any) {
    if (error?.code === "P2002") {
      return { error: "This board ID is already saved." };
    }
    console.error("Create board error:", error);
    return { error: error.message || "Failed to create board" };
  }
}

export async function deleteBoardAction(data: DeleteBoardInput) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const parsed = deleteBoardSchema.safeParse(data);
    if (!parsed.success) return { error: "Invalid data" };

    // Verify ownership
    const board = await prisma.userBoard.findFirst({
      where: { id: parsed.data.id, userId: session.user.id },
    });
    if (!board) return { error: "Board not found" };

    await prisma.userBoard.delete({ where: { id: parsed.data.id } });

    revalidatePath("/dashboard/settings/boards");
    return { success: true };
  } catch (error: any) {
    console.error("Delete board error:", error);
    return { error: error.message || "Failed to delete board" };
  }
}
