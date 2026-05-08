import { LayoutList, Globe, Lock, Clock } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import type { PinterestBoardItem } from "../types/pinterest.types";

interface PinterestBoardsTableProps {
  boards: PinterestBoardItem[];
}

export function PinterestBoardsTable({ boards }: PinterestBoardsTableProps) {
  if (boards.length === 0) {
    return (
      <EmptyState
        icon={LayoutList}
        title="No boards synced"
        description="Click Sync Boards to fetch your Pinterest boards."
      />
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50">
            <th className="text-left px-4 py-3 font-medium">Board Name</th>
            <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Privacy</th>
            <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Owner</th>
            <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Last Synced</th>
          </tr>
        </thead>
        <tbody>
          {boards.map((board) => (
            <tr key={board.id} className="border-t hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="font-medium">{board.name}</div>
                {board.description && (
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {board.description}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <div className="flex items-center gap-1.5">
                  {board.privacy === "PUBLIC" ? (
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="capitalize text-xs">
                    {board.privacy?.toLowerCase() || "unknown"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                {board.ownerUsername || "-"}
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                {board.lastSyncedAt ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs">
                      {board.lastSyncedAt.toLocaleDateString()}{" "}
                      {board.lastSyncedAt.toLocaleTimeString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Not synced</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
