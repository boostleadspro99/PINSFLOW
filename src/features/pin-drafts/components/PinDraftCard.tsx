"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Archive } from "lucide-react";
import Image from "next/image";
import { PinDraftWithRelations } from "../types/pin-draft.types";
import { updatePinDraftStatusAction } from "../actions/pin-draft.actions";
import { PinAssetPreview } from "@/features/pin-assets/components/PinAssetPreview";
import { GenerateImageButton } from "@/features/pin-assets/components/GenerateImageButton";
import { AttachImageUrlForm } from "@/features/pin-assets/components/AttachImageUrlForm";
import { PinAssetStatusBadge } from "@/features/pin-assets/components/PinAssetStatusBadge";
import { archivePinAssetAction } from "@/features/pin-assets/actions/pin-asset.actions";

export function PinDraftCard({ pinDraft, projectId }: { pinDraft: PinDraftWithRelations; projectId: string }) {
  const [statusLoading, setStatusLoading] = useState(false);
  const [archivingAssetId, setArchivingAssetId] = useState<string | null>(null);
  // Optimistic local status so UI updates immediately after Approve/Archive
  const [optimisticStatus, setOptimisticStatus] = useState<typeof pinDraft.status | null>(null);

  const displayStatus = optimisticStatus ?? pinDraft.status;

  const handleStatusChange = async (status: "APPROVED" | "ARCHIVED") => {
    setOptimisticStatus(status);
    setStatusLoading(true);
    try {
      await updatePinDraftStatusAction(pinDraft.id, projectId, status);
    } catch (err) {
      console.error("Failed to update pin draft status:", err);
      setOptimisticStatus(null);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleArchiveAsset = async (assetId: string) => {
    setArchivingAssetId(assetId);
    await archivePinAssetAction(assetId, projectId);
    setArchivingAssetId(null);
  };

  const asset = pinDraft.pinAsset;
  const hasReadyAsset = asset && asset.status === "READY";
  const hasFailedAsset = asset && asset.status === "FAILED";
  const hasArchivedAsset = asset && asset.status === "ARCHIVED";
  const hasAsset = !!asset;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{pinDraft.title}</CardTitle>
        <CardDescription className="text-xs text-purple-600 font-medium">
          Kw: {pinDraft.keyword.term}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {/* Image asset section */}
        {hasReadyAsset && (
          <PinAssetPreview
            asset={asset}
            onArchive={handleArchiveAsset}
            isArchiving={archivingAssetId === asset.id}
          />
        )}

        {hasFailedAsset && (
          <div className="space-y-2">
            <PinAssetStatusBadge status={asset.status} />
            <p className="text-sm text-muted-foreground">Image generation failed. Try again or attach a URL.</p>
            <GenerateImageButton pinDraftId={pinDraft.id} projectId={projectId} />
            <AttachImageUrlForm pinDraftId={pinDraft.id} projectId={projectId} />
          </div>
        )}

        {hasArchivedAsset && (
          <div className="space-y-2">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-muted flex items-center justify-center">
              {asset.imageUrl ? (
                <Image
                  src={asset.imageUrl}
                  alt="Archived asset"
                  fill
                  className="object-cover opacity-50"
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : null}
              <span className="relative text-sm text-muted-foreground font-medium bg-background/80 px-3 py-1 rounded">
                Archived
              </span>
            </div>
            {displayStatus === "APPROVED" && (
              <div className="space-y-2">
                <GenerateImageButton pinDraftId={pinDraft.id} projectId={projectId} />
                <AttachImageUrlForm pinDraftId={pinDraft.id} projectId={projectId} />
              </div>
            )}
          </div>
        )}

        {/* No asset yet */}
        {!hasAsset && (
          <>
            <p className="text-sm text-muted-foreground line-clamp-3">{pinDraft.description}</p>
            {pinDraft.overlayText && (
              <div className="bg-muted p-2 rounded text-xs">
                <strong>Overlay:</strong> {pinDraft.overlayText}
              </div>
            )}
            {displayStatus === "APPROVED" && (
              <div className="space-y-3 pt-2">
                <GenerateImageButton pinDraftId={pinDraft.id} projectId={projectId} />
                <AttachImageUrlForm pinDraftId={pinDraft.id} projectId={projectId} />
              </div>
            )}
          </>
        )}

        {/* Show description when we have an asset but no text shown yet */}
        {hasReadyAsset && pinDraft.overlayText && (
          <div className="bg-muted p-2 rounded text-xs">
            <strong>Overlay:</strong> {pinDraft.overlayText}
          </div>
        )}
      </CardContent>

      <div className="p-4 pt-0 flex gap-2">
        {displayStatus === "DRAFT" && (
          <>
            <Button size="sm" onClick={() => handleStatusChange("APPROVED")} disabled={statusLoading} className="w-full">
              <Check className="w-4 h-4 mr-2" /> Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleStatusChange("ARCHIVED")} disabled={statusLoading}>
              <Archive className="w-4 h-4" />
            </Button>
          </>
        )}
        {displayStatus !== "DRAFT" && displayStatus !== "APPROVED" && (
          <div className="text-xs font-semibold uppercase w-full text-center text-muted-foreground">
            {displayStatus}
          </div>
        )}
      </div>
    </Card>
  );
}
