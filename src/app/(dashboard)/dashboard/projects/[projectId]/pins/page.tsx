import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowLeft, BookOpenText } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProjectById } from "@/features/projects/queries/project.queries";
import { getProjectPinDrafts } from "@/features/pin-drafts/queries/pin-draft.queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PinDraftList } from "@/features/pin-drafts/components/PinDraftList";
import { QueuePublishForm } from "@/features/publishing/components/QueuePublishForm";
import type { BoardOption } from "@/features/publishing/components/QueuePublishForm";
import { PublishJobList } from "@/features/publishing/components/PublishJobList";
import { QueueStatusCard } from "@/features/publishing/components/QueueStatusCard";
import { getPublishJobsByProject } from "@/features/publishing/queries/publishing.queries";
import { PublishJobStatus } from "@prisma/client";
import { env } from "@/lib/env";

export default async function ProjectPinsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const project = await getProjectById(session.user.id, resolvedParams.projectId);

  if (!project) {
    return notFound();
  }

  const pinDrafts = await getProjectPinDrafts(session.user.id, resolvedParams.projectId);
  const publishJobs = await getPublishJobsByProject(session.user.id, resolvedParams.projectId);
  // Merge Pinterest-synced boards + manually created boards into a unified list
  const [userBoards, pinterestBoards] = await Promise.all([
    prisma.userBoard.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    }),
    prisma.pinterestBoard.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    }),
  ]);

  const pinterestBoardIds = new Set(pinterestBoards.map((b) => b.pinterestBoardId));
  const boards: BoardOption[] = [
    // Pinterest-synced boards first (real data from Pinterest API)
    ...pinterestBoards.map((b) => ({
      id: b.id,
      name: b.name,
      boardId: b.pinterestBoardId,
    })),
    // Manual UserBoards that don't overlap with synced boards
    ...userBoards
      .filter((b) => !pinterestBoardIds.has(b.boardId))
      .map((b) => ({
        id: b.id,
        name: b.name,
        boardId: b.boardId,
      })),
  ];

  // Check Pinterest access for Direct Pinterest provider
  // If Make webhook is configured, use Make as the publishing provider instead of Direct Pinterest
  const useMakeProvider = !!env.MAKE_WEBHOOK_URL;

  const pinterestAccount = await prisma.pinterestAccount.findUnique({
    where: { userId: session.user.id },
  });
  const hasPinterestAccess = !!(
    pinterestAccount?.status === "CONNECTED" &&
    pinterestAccount.scopes?.includes("pins:write")
  );

  // Find first APPROVED draft with READY asset for quick-publish
  const publishableDraft = pinDrafts.find(
    (d) => d.status === "APPROVED" && d.pinAsset?.status === "READY"
  );

  // Queue stats for the status widget
  const queueStats = {
    queued: await prisma.publishJob.count({
      where: { projectId: project.id, userId: session.user.id, status: PublishJobStatus.QUEUED },
    }),
    sending: await prisma.publishJob.count({
      where: { projectId: project.id, userId: session.user.id, status: PublishJobStatus.SENDING },
    }),
    failed: await prisma.publishJob.count({
      where: { projectId: project.id, userId: session.user.id, status: PublishJobStatus.FAILED },
    }),
    published: await prisma.publishJob.count({
      where: { projectId: project.id, userId: session.user.id, status: PublishJobStatus.PUBLISHED },
    }),
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/projects" className="hover:text-foreground">Projects</Link>
        <span className="mx-2">/</span>
        <Link href={`/dashboard/projects/${project.id}`} className="hover:text-foreground">{project.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium flex items-center gap-1">
          <BookOpenText className="w-3 h-3" /> Pin Drafts
        </span>
      </div>

      <PageHeader
        title="Pin Drafts"
        description="Review and manage generated pin drafts for your project."
      >
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/projects/${project.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
      </PageHeader>

      <PinDraftList projectId={project.id} pinDrafts={pinDrafts} />

      {/* Publish section */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
            <span className="text-sm font-bold text-purple-700">P</span>
          </div>
          <div>
            <h3 className="text-base font-semibold">Publish Pin</h3>
            <p className="text-xs text-muted-foreground">
              Publish this pin directly to Pinterest via the official API.
            </p>
          </div>
        </div>

        {publishableDraft ? (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">
              Ready to publish: <span className="text-purple-600">{publishableDraft.title}</span>
            </p>
            <QueuePublishForm
              pinDraftId={publishableDraft.id}
              pinAssetId={publishableDraft.pinAsset!.id}
              projectId={project.id}
              title={publishableDraft.title}
              description={publishableDraft.description}
              imageUrl={publishableDraft.pinAsset!.imageUrl}
              targetUrl={publishableDraft.targetUrl}
              boards={boards}
              hasPinterestAccess={hasPinterestAccess}
              useMakeProvider={useMakeProvider}
            />
          </div>
        ) : (
          <div className="border-t pt-4 text-center py-6 text-muted-foreground">
            <p className="text-sm">
              No approved drafts with a ready image asset.
            </p>
            <p className="text-xs mt-1">
              Approve a draft and generate an image to enable publishing.
            </p>
          </div>
        )}
      </div>

      {/* Queue Status */}
      <QueueStatusCard projectId={project.id} initialStats={queueStats} />

      {/* Publish Jobs History */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Publish History</h3>
        {publishJobs.length > 0 ? (
          <PublishJobList jobs={publishJobs as any} />
        ) : (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            <p className="text-sm">No publish jobs yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
