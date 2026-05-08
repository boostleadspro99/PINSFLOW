import { ProjectStatus } from "../types/project.types";
import { Badge } from "@/components/ui/badge";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  let color = "bg-gray-100 text-gray-800";
  
  if (status === "ACTIVE") {
    color = "bg-green-100 text-green-800 hover:bg-green-200";
  } else if (status === "PAUSED") {
    color = "bg-amber-100 text-amber-800 hover:bg-amber-200";
  } else if (status === "ARCHIVED") {
    color = "bg-gray-200 text-gray-800 hover:bg-gray-300";
  }
  
  return (
    <Badge variant="outline" className={`border-transparent font-medium ${color}`}>
      {status}
    </Badge>
  );
}
