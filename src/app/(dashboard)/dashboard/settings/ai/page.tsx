import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ArrowLeft, Brain } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { AISettingsForm } from "@/features/ai-settings/components/AISettingsForm";
import { ProjectSelector } from "@/features/ai-settings/components/ProjectSelector";

export default async function AISettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const resolvedParams = await searchParams;

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    select: { id: true, name: true, slug: true },
    orderBy: { createdAt: "desc" },
  });

  if (projects.length === 0) {
    redirect("/dashboard/projects");
  }

  // Determine selected project: URL param → first project
  const selectedProjectId = resolvedParams.projectId
    ? projects.find((p) => p.id === resolvedParams.projectId)?.id
    : projects[0].id;

  if (!selectedProjectId) {
    redirect("/dashboard/settings/ai");
  }

  const settings = await prisma.projectAISettings.findUnique({
    where: { projectId: selectedProjectId },
  });

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/settings" className="hover:text-foreground">Settings</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground font-medium flex items-center gap-1">
          <Brain className="w-3 h-3" /> AI Models
        </span>
      </div>

      <PageHeader
        title="AI Model Configuration"
        description="Choose which AI model is used for each task in your projects."
      >
        <Button variant="outline" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
        </Button>
      </PageHeader>

      <ProjectSelector
        projects={projects}
        selectedProjectId={selectedProjectId}
      />

      {selectedProject && (
        <div className="rounded-lg border p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Brain className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="text-base font-semibold">{selectedProject.name}</h3>
              <p className="text-xs text-muted-foreground">
                Settings apply to this project only. Each project can have its own AI model configuration.
              </p>
            </div>
          </div>

          <AISettingsForm
            projectId={selectedProjectId}
            currentSettings={settings}
          />
        </div>
      )}

      <div className="rounded-lg border border-dashed p-4">
        <h4 className="text-sm font-medium mb-2">Available Models</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="space-y-1">
            <p className="font-medium text-foreground">Active</p>
            <p>Gemini 2.0 Flash (default)</p>
            <p>Mock (test only)</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">Coming Soon</p>
            <p>Claude 3.5 Sonnet (OpenRouter)</p>
            <p>GPT-4o (OpenRouter)</p>
            <p>DeepSeek Chat</p>
          </div>
        </div>
      </div>
    </div>
  );
}
