"use client";

import { useState } from "react";
import { generateContentIdeasAction } from "../actions/content-idea.actions";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface GenerateIdeasButtonProps {
  projectId: string;
  keywordId: string;
  count?: number;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export function GenerateIdeasButton({ 
  projectId, 
  keywordId, 
  count = 5,
  variant = "outline",
  size = "sm",
  children
}: GenerateIdeasButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateContentIdeasAction({
        projectId,
        keywordId,
        count
      });
      
      if (result.success) {
        // Redirect to ideas page to see them
        router.push(`/dashboard/projects/${projectId}/ideas`);
      } else {
        alert(result.error || "Failed to generate ideas");
      }
    } catch (error) {
       console.error(error);
       alert("An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleGenerate} 
      disabled={isGenerating}
      className={isGenerating ? "animate-pulse" : ""}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
      )}
      {children || (isGenerating ? "Generating..." : "Generate Ideas")}
    </Button>
  );
}
