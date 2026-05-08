import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowLeft, Pin } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { BoardManager } from "@/features/user-boards/components/BoardManager";

export default async function BoardsSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const boards = await prisma.userBoard.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/settings" className="hover:text-foreground">Settings</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium flex items-center gap-1">
          <Pin className="w-3 h-3" /> Publish Boards
        </span>
      </div>

      <PageHeader
        title="Publish Boards"
        description="Add the Pinterest boards you want to publish to. You'll find the board ID in Make.com's Pinterest module dropdown."
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
        </Button>
      </PageHeader>

      <div className="rounded-lg border p-6">
        <BoardManager boards={boards} />
      </div>

      <div className="rounded-lg border border-dashed p-4">
        <h4 className="text-sm font-medium mb-2">How to find your Pinterest Board ID</h4>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Open your Make.com scenario and go to the Pinterest - Create a Pin module</li>
          <li>In the &quot;Board&quot; field, switch from dynamic mapping to dropdown selection</li>
          <li>You&apos;ll see your boards listed with their names and numeric IDs</li>
          <li>Copy the numeric ID for each board and save it here</li>
          <li>The board URL (e.g. pinterest.com/username/board-name/) is optional</li>
        </ol>
      </div>
    </div>
  );
}
