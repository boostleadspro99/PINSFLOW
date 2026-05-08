"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { updateProjectAISettingsAction } from "../actions/ai-settings.actions";
import { getModelsByCapability } from "@/config/ai-models";
import { AITaskType, AIModelStatus } from "@prisma/client";

interface AISettingsFormProps {
  projectId: string;
  currentSettings: {
    contentIdeasModelId?: string | null;
    pinDraftsModelId?: string | null;
    imagePromptModelId?: string | null;
    fallbackModelId?: string | null;
  } | null;
}

export function AISettingsForm({ projectId, currentSettings }: AISettingsFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const contentIdeasModels = getModelsByCapability(AITaskType.CONTENT_IDEAS);
  const pinDraftsModels = getModelsByCapability(AITaskType.PIN_DRAFTS);
  const imagePromptModels = getModelsByCapability(AITaskType.IMAGE_PROMPT);
  const allActiveModels = [
    ...contentIdeasModels,
    ...pinDraftsModels,
    ...imagePromptModels,
    ...getModelsByCapability(AITaskType.BOARD_RECOMMENDATION),
    ...getModelsByCapability(AITaskType.ANALYTICS_RECOMMENDATION),
  ].filter((m, i, arr) => arr.findIndex((x) => x.modelKey === m.modelKey) === i);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProjectAISettingsAction(formData);
    setIsSaving(false);

    if (result.success) {
      setMessage({ type: "success", text: "AI settings saved." });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to save settings." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="space-y-2">
        <Label htmlFor="contentIdeasModelId">Content Ideas Model</Label>
        <Select
          name="contentIdeasModelId"
          defaultValue={currentSettings?.contentIdeasModelId ?? ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Default (Gemini 2.0 Flash)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Default (Gemini 2.0 Flash)</SelectItem>
            {contentIdeasModels.map((model) => (
              <SelectItem
                key={model.modelKey}
                value={model.modelKey}
                disabled={model.status !== AIModelStatus.ACTIVE}
              >
                {model.displayName}
                {model.status === AIModelStatus.DISABLED ? " (coming soon)" : ""}
                {model.status === AIModelStatus.TESTING ? " (beta)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Model used when generating content ideas from keywords.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pinDraftsModelId">Pin Draft Model</Label>
        <Select
          name="pinDraftsModelId"
          defaultValue={currentSettings?.pinDraftsModelId ?? ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Default (Gemini 2.0 Flash)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Default (Gemini 2.0 Flash)</SelectItem>
            {pinDraftsModels.map((model) => (
              <SelectItem
                key={model.modelKey}
                value={model.modelKey}
                disabled={model.status !== AIModelStatus.ACTIVE}
              >
                {model.displayName}
                {model.status === AIModelStatus.DISABLED ? " (coming soon)" : ""}
                {model.status === AIModelStatus.TESTING ? " (beta)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Model used when generating pin drafts from content ideas.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imagePromptModelId">Image Prompt Model</Label>
        <Select
          name="imagePromptModelId"
          defaultValue={currentSettings?.imagePromptModelId ?? ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Default (Gemini 2.0 Flash)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Default (Gemini 2.0 Flash)</SelectItem>
            {imagePromptModels.map((model) => (
              <SelectItem
                key={model.modelKey}
                value={model.modelKey}
                disabled={model.status !== AIModelStatus.ACTIVE}
              >
                {model.displayName}
                {model.status === AIModelStatus.DISABLED ? " (coming soon)" : ""}
                {model.status === AIModelStatus.TESTING ? " (beta)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Model used when generating image prompts for pin assets.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fallbackModelId">Fallback Model</Label>
        <Select
          name="fallbackModelId"
          defaultValue={currentSettings?.fallbackModelId ?? ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="None (use task default)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None (use task default)</SelectItem>
            {allActiveModels.map((model) => (
              <SelectItem
                key={model.modelKey}
                value={model.modelKey}
                disabled={model.status !== AIModelStatus.ACTIVE}
              >
                {model.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Global fallback if a task-specific model is not set.
        </p>
      </div>

      {message && (
        <div
          className={`text-sm p-3 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Button type="submit" disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          "Save AI Settings"
        )}
      </Button>
    </form>
  );
}
