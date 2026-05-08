"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { UserBoard } from "@prisma/client";
import { createBoardAction, deleteBoardAction } from "../actions/user-board.actions";

interface BoardManagerProps {
  boards: UserBoard[];
}

export function BoardManager({ boards }: BoardManagerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsAdding(true);

    const formData = new FormData(e.currentTarget);
    const result = await createBoardAction({
      name: formData.get("name") as string,
      boardId: formData.get("boardId") as string,
      boardUrl: formData.get("boardUrl") as string,
    });

    setIsAdding(false);

    if (result.success) {
      setIsOpen(false);
      router.refresh();
    } else {
      setError(result.error ?? "Failed to add board");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteBoardAction({ id });
    setDeletingId(null);

    if (result.success) {
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">My Boards</h3>
          <p className="text-sm text-muted-foreground">
            Boards saved here appear in the publish form dropdown.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Board
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Pinterest Board</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Board Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Carnet de Voyage"
                  required
                  disabled={isAdding}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boardId">Pinterest Board ID *</Label>
                <Input
                  id="boardId"
                  name="boardId"
                  placeholder="e.g. 123456789012345678"
                  required
                  disabled={isAdding}
                />
                <p className="text-xs text-muted-foreground">
                  Find this in Make.com's Pinterest module dropdown when selecting a board.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="boardUrl">Board URL (optional)</Label>
                <Input
                  id="boardUrl"
                  name="boardUrl"
                  placeholder="https://www.pinterest.com/username/board/"
                  disabled={isAdding}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" disabled={isAdding} className="w-full">
                {isAdding ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...</>
                ) : (
                  "Add Board"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <p className="text-sm">No boards saved yet.</p>
          <p className="text-xs mt-1">Add a board to start publishing pins.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {boards.map((board) => (
            <div
              key={board.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{board.name}</p>
                <p className="text-xs text-muted-foreground">
                  ID: {board.boardId}
                  {board.boardUrl && (
                    <>
                      <span className="mx-1">·</span>
                      <a
                        href={board.boardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" /> Open
                      </a>
                    </>
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(board.id)}
                disabled={deletingId === board.id}
              >
                {deletingId === board.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-500" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
