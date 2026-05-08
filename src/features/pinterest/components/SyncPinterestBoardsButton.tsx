"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  syncPinterestBoardsAction,
  type SyncBoardsActionResult,
} from "../actions/sync-pinterest-boards.action";

const initialState: SyncBoardsActionResult = { success: true, boardCount: 0 };

interface SyncPinterestBoardsButtonProps {
  accountId: string;
}

export function SyncPinterestBoardsButton({ accountId }: SyncPinterestBoardsButtonProps) {
  const [state, formAction, isPending] = useActionState(syncPinterestBoardsAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="accountId" value={accountId} />
      <Button type="submit" variant="secondary" disabled={isPending}>
        {isPending ? "Syncing..." : "Sync Boards"}
      </Button>
      {state && "success" in state && state.success && state.boardCount > 0 && (
        <p className="text-xs text-green-600 mt-1">
          Synced {state.boardCount} board{state.boardCount !== 1 ? "s" : ""}.
        </p>
      )}
      {state && "error" in state && state.error && (
        <p className="text-xs text-destructive mt-1">{state.error}</p>
      )}
    </form>
  );
}
