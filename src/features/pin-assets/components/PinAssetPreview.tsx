"use client";

import Image from "next/image";
import { PinAsset } from "@prisma/client";
import { PinAssetStatusBadge } from "./PinAssetStatusBadge";
import { Archive, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PinAssetPreviewProps {
  asset: PinAsset;
  onArchive?: (assetId: string) => void;
  isArchiving?: boolean;
}

export function PinAssetPreview({ asset, onArchive, isArchiving }: PinAssetPreviewProps) {
  if (asset.status === "ARCHIVED") {
    return (
      <div className="relative aspect-[2/3] w-full rounded-md bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Asset archived</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-muted">
        <Image
          src={asset.imageUrl}
          alt={asset.prompt ?? "Pin image"}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2">
          <PinAssetStatusBadge status={asset.status} />
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          {asset.storageProvider}
        </span>
        <span>
          {asset.width}×{asset.height}
        </span>
      </div>
      {asset.status === "READY" && onArchive && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onArchive(asset.id)}
          disabled={isArchiving}
        >
          <Archive className="w-3 h-3 mr-2" />
          {isArchiving ? "Archiving..." : "Archive"}
        </Button>
      )}
    </div>
  );
}
