"use client";

import { ContentIdeaWithKeywordAndDraft } from "../queries/content-idea.queries";
import { ContentIdeaCard } from "./ContentIdeaCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface ContentIdeaListProps {
  projectId: string;
  ideas: ContentIdeaWithKeywordAndDraft[];
}

export function ContentIdeaList({ projectId, ideas }: ContentIdeaListProps) {
  if (ideas.length === 0) {
    return (
      <EmptyState
        title="No content ideas yet"
        description="Head over to your Keywords library and generate some AI content ideas to get started."
        icon={Sparkles}
      >
        <div className="mt-6">
           <Link href={`/dashboard/projects/${projectId}/keywords`}>
             <Button>Go to Keywords</Button>
           </Link>
        </div>
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {ideas.map((idea) => (
        <ContentIdeaCard key={idea.id} idea={idea} projectId={projectId} />
      ))}
    </div>
  );
}
