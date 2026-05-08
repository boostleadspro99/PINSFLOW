import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getProjectById } from "@/features/projects/queries/project.queries";
import { getProjectKeywords } from "@/features/keywords/queries/keyword.queries";
import { PageHeader } from "@/components/shared/PageHeader";

import { KeywordList } from "@/features/keywords/components/KeywordList";
import { KeywordForm } from "@/features/keywords/components/KeywordForm";
import { KeywordImportForm } from "@/features/keywords/components/KeywordImportForm";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProjectKeywordsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const project = await getProjectById(session.user.id, resolvedParams.projectId);

  if (!project) {
    return notFound();
  }

  const keywords = await getProjectKeywords(session.user.id, project.id);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/projects" className="hover:text-foreground">Projects</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/dashboard/projects/${project.id}`} className="hover:text-foreground line-clamp-1 max-w-[150px] truncate">{project.name}</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Keywords</span>
      </div>

      <PageHeader 
        title="Keywords & Ideas" 
        description="Manage the niche keywords and topics for this project."
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Keywords</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Add Keywords</DialogTitle>
              <DialogDescription>
                Add keywords manually or import a list.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="manual" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="import">Bulk Import</TabsTrigger>
              </TabsList>
              <TabsContent value="manual" className="pt-4">
                <KeywordForm projectId={project.id} />
              </TabsContent>
              <TabsContent value="import" className="pt-4">
                <KeywordImportForm projectId={project.id} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" /> 
            Keyword Library
          </CardTitle>
          <CardDescription>
            A total of {keywords.length} keywords in this project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KeywordList projectId={project.id} keywords={keywords} />
        </CardContent>
      </Card>
    </div>
  );
}
