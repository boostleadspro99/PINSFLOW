"use client";

import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectSwitcherPlaceholder() {
  return (
    <Button variant="outline" className="w-full justify-between h-auto py-2 px-3">
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Project</span>
        <span className="font-medium text-sm truncate max-w-[150px]">Select a Project</span>
      </div>
      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );
}
