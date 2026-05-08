import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { Settings, Image as ImageIcon, FileText, Calendar, BarChart, Sparkles } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getProjectById } from "@/features/projects/queries/project.queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProjectStatusBadge } from "@/features/projects/components/ProjectStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
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
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/projects" className="hover:text-foreground">Projects</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium">{project.name}</span>
      </div>

      <PageHeader 
        title={project.name} 
        description={project.description || "No description provided."}
      >
        <div className="flex items-center gap-4">
          <ProjectStatusBadge status={project.status} />
          <Button variant="outline" asChild>
            <Link href={`/dashboard/projects/${project.id}/edit`}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href={`/dashboard/projects/${project.id}/keywords`} className="block">
          <Card className="transition-all hover:border-primary/50 hover:shadow-sm cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Keywords 
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Manage your niche keywords and terms.</p>
              <span className="inline-block mt-3 text-[10px] font-semibold bg-primary/10 text-primary px-2 py-1 rounded">Active</span>
            </CardContent>
          </Card>
        </Link>
        
        <Link href={`/dashboard/projects/${project.id}/ideas`} className="block">
          <Card className="transition-all hover:border-purple-500/50 hover:shadow-sm cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700">
                <Sparkles className="h-4 w-4" /> Content Ideas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Generate AI ideas from keywords.</p>
              <span className="inline-block mt-3 text-[10px] font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded">Active (Phase 5)</span>
            </CardContent>
          </Card>
        </Link>

        <Card className="opacity-60 grayscale cursor-not-allowed transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Pin Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Generate arrays of Pinterest images with AI.</p>
            <span className="inline-block mt-3 text-[10px] font-semibold bg-muted px-2 py-1 rounded">Coming Soon (Phase 5)</span>
          </CardContent>
        </Card>

        <Card className="opacity-60 grayscale cursor-not-allowed transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Schedule your pins to be published automatically.</p>
            <span className="inline-block mt-3 text-[10px] font-semibold bg-muted px-2 py-1 rounded">Coming Soon (Phase 6)</span>
          </CardContent>
        </Card>

        <Card className="opacity-60 grayscale cursor-not-allowed transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart className="h-4 w-4" /> Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Track performance and engagement metrics.</p>
            <span className="inline-block mt-3 text-[10px] font-semibold bg-muted px-2 py-1 rounded">Coming Soon (Phase 7)</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Configuration for this niche.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Language</div>
              <div className="font-medium">{project.language.toUpperCase()}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Country</div>
              <div className="font-medium">{project.country.toUpperCase()}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Target Audience</div>
              <div className="font-medium">{project.targetAudience || "Not specified"}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Default Website</div>
              <div className="font-medium truncate">
                {project.defaultWebsiteUrl ? (
                  <a href={project.defaultWebsiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                    {project.defaultWebsiteUrl}
                  </a>
                ) : "Not specified"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
