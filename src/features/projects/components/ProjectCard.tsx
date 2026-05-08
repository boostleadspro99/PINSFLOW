import Link from "next/link";
import { FolderOpen, Settings, MoreVertical } from "lucide-react";
import { Project } from "../types/project.types";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-4 border-b bg-muted/20 flex flex-row items-start justify-between space-y-0">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">
            <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
              {project.name}
            </Link>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            /{project.slug}
          </p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {project.description || "No description provided."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {project.language && <span className="px-2 py-1 bg-muted rounded-md">{project.language.toUpperCase()}</span>}
          {project.country && <span className="px-2 py-1 bg-muted rounded-md">{project.country.toUpperCase()}</span>}
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4 px-6 flex justify-between border-t mt-auto">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href={`/dashboard/projects/${project.id}`}>
            <FolderOpen className="h-4 w-4 mr-2" /> Open
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <Settings className="h-4 w-4 mr-2" /> Settings
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
