import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getProjectById } from "@/features/projects/queries/project.queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProjectForm } from "@/features/projects/components/ProjectForm";
import { ArchiveProjectButton } from "@/features/projects/components/ArchiveProjectButton";

export default async function EditProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const project = await getProjectById(session.user.id, resolvedParams.projectId);

  if (!project) {
    return notFound();
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/projects" className="hover:text-foreground">Projects</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/dashboard/projects/${project.id}`} className="hover:text-foreground line-clamp-1 max-w-[150px] truncate">{project.name}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Settings</span>
      </div>

      <PageHeader 
        title="Project Settings" 
        description="Update your project configuration and defaults."
      />

      <div className="grid md:grid-cols-[1fr_250px] gap-8 items-start">
        <div className="order-2 md:order-1">
          <ProjectForm initialData={project} />
        </div>
        
        <div className="order-1 md:order-2 space-y-4">
          <div className="border border-red-200 bg-red-50/50 rounded-lg p-5">
            <h3 className="font-medium text-red-800 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-600/80 mb-4">
              Archiving this project will hide it from active views and pause any related running campaigns. 
              (Hard deletion will be available later).
            </p>
            <ArchiveProjectButton projectId={project.id} isArchived={project.status === "ARCHIVED"} />
          </div>
        </div>
      </div>
    </div>
  );
}
