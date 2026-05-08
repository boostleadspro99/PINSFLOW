import { KeywordSource } from "../types/keyword.types";
import { Badge } from "@/components/ui/badge";
import { Database, Upload, Wand2 } from "lucide-react";

export function KeywordSourceBadge({ source }: { source: KeywordSource }) {
  if (source === "MANUAL") {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground flex items-center gap-1">
        <Database className="h-3 w-3" /> Manual
      </Badge>
    );
  }
  if (source === "CSV") {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground flex items-center gap-1">
        <Upload className="h-3 w-3" /> Import
      </Badge>
    );
  }
  if (source === "AI") {
    return (
      <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 bg-purple-50 flex items-center gap-1">
        <Wand2 className="h-3 w-3" /> AI
      </Badge>
    );
  }
  
  return <Badge variant="outline">{source}</Badge>;
}
