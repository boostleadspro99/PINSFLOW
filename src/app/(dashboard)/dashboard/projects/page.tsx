import { Plus } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { getUserProjects } from "@/features/projects/queries/project.queries";
import { ProjectList } from "@/features/projects/components/ProjectList";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const projects = await getUserProjects(session.user.id);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader 
        title="Projects" 
        description="Manage your Pinterest content spaces. Each project represents a niche or website."
      >
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Link>
        </Button>
      </PageHeader>

      <ProjectList projects={projects} />
    </div>
  );
}
