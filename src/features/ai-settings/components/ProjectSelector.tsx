"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectSelectorProps {
  projects: { id: string; name: string; slug: string }[];
  selectedProjectId: string;
}

export function ProjectSelector({ projects, selectedProjectId }: ProjectSelectorProps) {
  const router = useRouter();

  const handleChange = (projectId: string) => {
    router.push(`/dashboard/settings/ai?projectId=${projectId}`);
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium whitespace-nowrap">Project:</label>
      <Select value={selectedProjectId} onValueChange={handleChange}>
        <SelectTrigger className="w-full max-w-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
