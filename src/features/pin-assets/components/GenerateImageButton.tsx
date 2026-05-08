"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2 } from "lucide-react";
import { generatePinAssetAction } from "../actions/pin-asset.actions";

interface GenerateImageButtonProps {
  pinDraftId: string;
  projectId: string;
  disabled?: boolean;
  onStart?: () => void;
  onComplete?: (success: boolean, error?: string) => void;
}

export function GenerateImageButton({
  pinDraftId,
  projectId,
  disabled,
  onStart,
  onComplete,
}: GenerateImageButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    onStart?.();

    const result = await generatePinAssetAction(pinDraftId, projectId);

    setLoading(false);
    onComplete?.(result.success, result.success ? undefined : result.error);
  };

  return (
    <Button
      size="sm"
      onClick={handleClick}
      disabled={disabled || loading}
      className="w-full"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="w-4 h-4 mr-2" />
          Generate Image
        </>
      )}
    </Button>
  );
}
