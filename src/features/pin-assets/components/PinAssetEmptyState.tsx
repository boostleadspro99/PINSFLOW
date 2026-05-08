import { ImageIcon } from "lucide-react";

export function PinAssetEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <ImageIcon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-muted-foreground">No image asset yet</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Generate an image from the pin draft or attach an external image URL.
      </p>
    </div>
  );
}
