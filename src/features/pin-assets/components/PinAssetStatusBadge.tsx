import { PinAssetStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<PinAssetStatus, { label: string; className: string }> = {
  GENERATING: { label: "Generating", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  READY: { label: "Ready", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-800 hover:bg-red-100" },
  ARCHIVED: { label: "Archived", className: "bg-gray-100 text-gray-600 hover:bg-gray-100" },
};

export function PinAssetStatusBadge({ status }: { status: PinAssetStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
