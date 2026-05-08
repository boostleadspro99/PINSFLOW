import { z } from "zod";

export const createBoardSchema = z.object({
  name: z.string().min(1, "Board name is required").max(200, "Board name is too long"),
  boardId: z.string().min(1, "Pinterest board ID is required").max(100, "Board ID is too long"),
  boardUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const deleteBoardSchema = z.object({
  id: z.string().cuid("Invalid board ID"),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type DeleteBoardInput = z.infer<typeof deleteBoardSchema>;
