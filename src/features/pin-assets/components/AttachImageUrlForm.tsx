"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Loader2 } from "lucide-react";
import { attachPinAssetUrlAction } from "../actions/pin-asset.actions";

interface AttachImageUrlFormProps {
  pinDraftId: string;
  projectId: string;
  onComplete?: (success: boolean, error?: string) => void;
}

export function AttachImageUrlForm({ pinDraftId, projectId, onComplete }: AttachImageUrlFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    const result = await attachPinAssetUrlAction(pinDraftId, projectId, url.trim());

    setLoading(false);

    if (result.success) {
      setUrl("");
      onComplete?.(true);
    } else {
      setError(result.error);
      onComplete?.(false, result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="Paste external image URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="text-sm"
        />
        <Button type="submit" size="sm" disabled={loading || !url.trim()}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Link2 className="w-4 h-4" />
          )}
          <span className="ml-2 hidden sm:inline">Attach</span>
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
