import { ContentIdeaStatus } from "../types/content-idea.types";
import { Badge } from "@/components/ui/badge";

export function ContentIdeaStatusBadge({ status }: { status: ContentIdeaStatus }) {
  let color = "bg-gray-100 text-gray-800";
  
  if (status === "DRAFT") color = "bg-blue-100 text-blue-800 hover:bg-blue-200";
  if (status === "APPROVED") color = "bg-green-100 text-green-800 hover:bg-green-200";
  if (status === "REJECTED") color = "bg-orange-100 text-orange-800 hover:bg-orange-200";
  if (status === "ARCHIVED") color = "bg-gray-200 text-gray-800 hover:bg-gray-300";
  
  return (
    <Badge variant="outline" className={`border-transparent font-medium text-xs ${color}`}>
      {status}
    </Badge>
  );
}
