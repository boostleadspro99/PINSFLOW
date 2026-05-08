import { Project } from "../types/project.types";
import { ProjectCard } from "./ProjectCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  if (!projects.length) {
    return (
      <div className="border border-dashed rounded-lg">
        <EmptyState 
          icon={FolderOpen} 
          title="No projects found" 
          description="You don't have any projects yet. Create your first project to get started."
        >
          <Button asChild>
            <Link href="/dashboard/projects/new">
              Create Project
            </Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
