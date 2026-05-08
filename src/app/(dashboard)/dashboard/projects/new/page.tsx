import { PageHeader } from "@/components/shared/PageHeader";
import { ProjectForm } from "@/features/projects/components/ProjectForm";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function NewProjectPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
        <Link href="/dashboard/projects" className="hover:text-foreground">Projects</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">New Project</span>
      </div>

      <PageHeader 
        title="Create Project" 
        description="Set up a new Pinterest niche or campaign."
      />

      <ProjectForm />
    </div>
  );
}
