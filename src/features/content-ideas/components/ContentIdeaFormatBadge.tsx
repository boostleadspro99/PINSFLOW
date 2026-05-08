import { ContentIdeaFormat } from "../types/content-idea.types";
import { Badge } from "@/components/ui/badge";

export function ContentIdeaFormatBadge({ format }: { format: ContentIdeaFormat }) {
  return (
    <Badge variant="secondary" className="text-xs">
      {format.replace(/_/g, " ")}
    </Badge>
  );
}
