"use client";

import { ContentIdeaWithKeywordAndDraft } from "@/features/content-ideas/queries/content-idea.queries";
import { ContentIdeaFormatBadge } from "./ContentIdeaFormatBadge";
import { ContentIdeaStatusBadge } from "./ContentIdeaStatusBadge";
import { updateContentIdeaStatusAction } from "../actions/content-idea.actions";
import { createPinDraftAction } from "@/features/pin-drafts/actions/pin-draft.actions";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Check, X, Archive, Wand2, ArrowRight } from "lucide-react";
import { useState } from "react";

interface ContentIdeaCardProps {
  idea: ContentIdeaWithKeywordAndDraft;
  projectId: string;
}

export function ContentIdeaCard({ idea, projectId }: ContentIdeaCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (status: "APPROVED" | "REJECTED" | "ARCHIVED") => {
    setIsUpdating(true);
    await updateContentIdeaStatusAction({
      projectId,
      ideaId: idea.id,
      status,
    });
    setIsUpdating(false);
  };

  const handleGeneratePinDraft = async () => {
    setIsUpdating(true);
    await createPinDraftAction(idea.id, projectId);
    setIsUpdating(false);
  };

  return (
    <Card className={`transition-all ${idea.status === "ARCHIVED" || idea.status === "REJECTED" ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div>
            {idea.keyword && (
              <div className="text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block mb-2 uppercase tracking-wide">
                Kw: {idea.keyword.term}
              </div>
            )}
            <CardTitle className="text-base leading-tight font-semibold">
              {idea.title}
            </CardTitle>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
             <ContentIdeaStatusBadge status={idea.status} />
             <div className="text-xs font-medium text-muted-foreground mt-2">Score: {idea.aiScore}/100</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Angle</p>
          <p className="text-sm text-foreground">{idea.angle}</p>
        </div>
        {idea.audience && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Audience</p>
            <p className="text-sm text-foreground">{idea.audience}</p>
          </div>
        )}
        <div className="flex gap-2 items-center flex-wrap">
          <ContentIdeaFormatBadge format={idea.format} />
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex gap-2 border-t mt-4 border-dashed pt-4">
        {idea.status !== "APPROVED" && (
          <Button size="sm" variant="outline" className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50" disabled={isUpdating} onClick={() => handleStatusChange("APPROVED")}>
            <Check className="w-4 h-4 mr-1"/> Approve
          </Button>
        )}
        {idea.status === "APPROVED" && !idea.pinDraft && (
          <Button size="sm" variant="default" className="flex-1" disabled={isUpdating} onClick={handleGeneratePinDraft}>
            <Wand2 className="w-4 h-4 mr-1"/> Create Pin Draft
          </Button>
        )}
        {idea.status === "APPROVED" && idea.pinDraft && (
          <div className="flex gap-2 w-full">
            <Button size="sm" variant="secondary" className="flex-1" disabled>
               Pin Draft Created
            </Button>
            <Button size="sm" variant="default" asChild>
              <Link href={`/dashboard/projects/${projectId}/pins`}>
                View in Pins
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        )}
        {idea.status !== "REJECTED" && idea.status !== "ARCHIVED" && idea.status !== "APPROVED" && (
          <Button size="sm" variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" disabled={isUpdating} onClick={() => handleStatusChange("REJECTED")}>
            <X className="w-4 h-4" />
          </Button>
        )}
        {idea.status !== "ARCHIVED" && (
          <Button size="sm" variant="ghost" className="text-muted-foreground" disabled={isUpdating} onClick={() => handleStatusChange("ARCHIVED")}>
            <Archive className="w-4 h-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
