import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getProjectById } from "@/features/projects/queries/project.queries";
import { getProjectContentIdeas } from "@/features/content-ideas/queries/content-idea.queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ContentIdeaList } from "@/features/content-ideas/components/ContentIdeaList";

export default async function ProjectIdeasPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const project = await getProjectById(session.user.id, resolvedParams.projectId);

  if (!project) {
    return notFound();
  }

  const ideas = await getProjectContentIdeas(session.user.id, resolvedParams.projectId);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/projects" className="hover:text-foreground">Projects</Link>
        <span className="mx-2">/</span>
        <Link href={`/dashboard/projects/${project.id}`} className="hover:text-foreground">{project.name}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Content Ideas
        </span>
      </div>

      <PageHeader 
        title="Content Ideas" 
        description="View and manage generated AI content ideas for your project."
      >
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/projects/${project.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/projects/${project.id}/keywords`}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate More
            </Link>
          </Button>
        </div>
      </PageHeader>

      <ContentIdeaList projectId={project.id} ideas={ideas} />
    </div>
  );
}
