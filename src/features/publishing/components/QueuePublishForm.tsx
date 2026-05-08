"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, Loader2, SendHorizonal } from "lucide-react";
import { queuePublishJobAction } from "../actions/queue-publish-job.action";

export interface BoardOption {
  id: string;
  name: string;
  boardId: string;
}

interface QueuePublishFormProps {
  pinDraftId: string;
  pinAssetId: string;
  projectId: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl?: string | null;
  boards: BoardOption[];
  hasPinterestAccess: boolean;
}

export function QueuePublishForm({
  pinDraftId,
  pinAssetId,
  projectId,
  title,
  description,
  imageUrl,
  targetUrl,
  boards,
  hasPinterestAccess,
}: QueuePublishFormProps) {
  const router = useRouter();
  const [selectedBoardId, setSelectedBoardId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  const handleQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedBoardId) {
      setMessage({ type: "error", text: "Please select a board." });
      return;
    }

    setIsPublishing(true);

    const formData = new FormData();
    formData.set("pinDraftId", pinDraftId);
    formData.set("pinAssetId", pinAssetId);
    formData.set("projectId", projectId);
    formData.set("boardId", selectedBoard?.boardId ?? selectedBoardId);
    formData.set("boardName", selectedBoard?.name ?? "");
    formData.set("title", title);
    formData.set("description", description);
    formData.set("imageUrl", imageUrl);
    if (targetUrl) formData.set("targetUrl", targetUrl);
    formData.set("provider", "DIRECT_PINTEREST");
    if (scheduledAt) formData.set("scheduledAt", scheduledAt);

    const result = await queuePublishJobAction(formData);
    setIsPublishing(false);

    if (result.success) {
      const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();
      setMessage({
        type: "success",
        text: isScheduled
          ? "Pin scheduled for publishing!"
          : "Pin queued for publishing!",
      });
      setSelectedBoardId("");
      setScheduledAt("");
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error ?? "Failed to queue." });
    }
  };

  if (!hasPinterestAccess) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        <p className="font-medium">Pinterest account not connected</p>
        <p className="mt-1 text-xs">
          Go to{' '}
          <a href="/dashboard/settings/pinterest" className="underline hover:text-foreground">
            Pinterest Settings
          </a>{' '}
          to connect your account before publishing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleQueue} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="board">Pinterest Board *</Label>
        {boards.length > 0 ? (
          <Select value={selectedBoardId} onValueChange={setSelectedBoardId} disabled={isPublishing}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a board..." />
            </SelectTrigger>
            <SelectContent>
              {boards.map((board) => (
                <SelectItem key={board.id} value={board.id}>
                  {board.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm text-muted-foreground border rounded-md p-3">
            No boards saved yet.{' '}
            <a href="/dashboard/settings/pinterest" className="underline hover:text-foreground">
              Sync your Pinterest boards
            </a>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="scheduledAt">Schedule (optional)</Label>
        <Input
          id="scheduledAt"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          disabled={isPublishing}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to publish immediately.
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

      <Button
        type="submit"
        disabled={isPublishing || boards.length === 0}
        className="w-full"
      >
        {isPublishing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {scheduledAt ? "Scheduling..." : "Queuing..."}
          </>
        ) : (
          <>
            {scheduledAt ? (
              <CalendarClock className="h-4 w-4 mr-2" />
            ) : (
              <SendHorizonal className="h-4 w-4 mr-2" />
            )}
            {scheduledAt ? "Schedule for Publishing" : "Queue for Publishing"}
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Pin is queued for direct publishing via the official Pinterest API.
      </p>
    </form>
  );
}
