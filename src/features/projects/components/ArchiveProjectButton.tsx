"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { archiveProjectAction } from "../actions/project.actions";

interface ArchiveProjectButtonProps {
  projectId: string;
  isArchived: boolean;
}

export function ArchiveProjectButton({ projectId, isArchived }: ArchiveProjectButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleArchive = async () => {
    if (confirm("Are you sure you want to archive this project?")) {
      setIsLoading(true);
      try {
        await archiveProjectAction(projectId);
        router.push("/dashboard/projects");
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isArchived) {
    return (
      <Button variant="outline" className="w-full" disabled>
        Already Archived
      </Button>
    );
  }

  return (
    <Button 
      variant="destructive" 
      className="w-full bg-red-600 hover:bg-red-700 text-white" 
      onClick={handleArchive}
      disabled={isLoading}
    >
      <Archive className="h-4 w-4 mr-2" />
      {isLoading ? "Archiving..." : "Archive Project"}
    </Button>
  );
}
