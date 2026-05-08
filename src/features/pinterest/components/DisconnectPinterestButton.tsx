"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  disconnectPinterestAction,
  type DisconnectActionResult,
} from "../actions/disconnect-pinterest.action";

const initialState: DisconnectActionResult = { success: true };

interface DisconnectPinterestButtonProps {
  accountId: string;
}

export function DisconnectPinterestButton({ accountId }: DisconnectPinterestButtonProps) {
  const [state, formAction, isPending] = useActionState(disconnectPinterestAction, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="accountId" value={accountId} />
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? "Disconnecting..." : "Disconnect"}
      </Button>
      {state && "error" in state && state.error && (
        <p className="text-xs text-destructive mt-1">{state.error}</p>
      )}
    </form>
  );
}
