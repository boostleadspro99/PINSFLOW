"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle, XCircle, Clock, SendHorizonal } from "lucide-react";
import { processQueueAction, getQueueStatsAction } from "../actions/process-queue.action";
import type { QueueStats } from "../actions/process-queue.action";

interface QueueStatusCardProps {
  projectId: string;
  initialStats: QueueStats;
}

export function QueueStatusCard({ projectId, initialStats }: QueueStatusCardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<QueueStats>(initialStats);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const refreshStats = useCallback(async () => {
    const fresh = await getQueueStatsAction(projectId);
    setStats(fresh);
  }, [projectId]);

  const handleProcessQueue = async () => {
    setIsProcessing(true);
    setResult(null);

    const res = await processQueueAction(projectId, 1);
    if (res.success) {
      const label =
        res.status === "SUCCESS" ? "Pin published successfully!" :
        res.status === "PARTIAL" ? "Some pins published, some failed." :
        res.status === "NO_JOBS" ? "No pending jobs to process." :
        "All jobs failed.";
      setResult({ type: "success", message: label });
      await refreshStats();
      router.refresh();
    } else {
      setResult({ type: "error", message: res.error ?? "Failed to process queue." });
    }

    setIsProcessing(false);
  };

  const hasQueuedJobs = stats.queued > 0;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-4 w-4 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Publish Queue</h3>
            <p className="text-xs text-muted-foreground">
              Process queued pins automatically
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleProcessQueue}
          disabled={isProcessing || !hasQueuedJobs}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Process Now
            </>
          )}
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="rounded bg-sky-50 p-2">
          <div className="text-lg font-bold text-sky-700">{stats.queued}</div>
          <div className="text-muted-foreground">Queued</div>
        </div>
        <div className="rounded bg-blue-50 p-2">
          <div className="text-lg font-bold text-blue-700">{stats.sending}</div>
          <div className="text-muted-foreground">Sending</div>
        </div>
        <div className="rounded bg-green-50 p-2">
          <div className="text-lg font-bold text-green-700">{stats.published}</div>
          <div className="text-muted-foreground">Published</div>
        </div>
        <div className="rounded bg-red-50 p-2">
          <div className="text-lg font-bold text-red-700">{stats.failed}</div>
          <div className="text-muted-foreground">Failed</div>
        </div>
      </div>

      {/* Result message */}
      {result && (
        <div
          className={`text-xs p-2 rounded-md ${
            result.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {result.type === "success" ? (
            <CheckCircle className="h-3 w-3 inline mr-1" />
          ) : (
            <XCircle className="h-3 w-3 inline mr-1" />
          )}
          {result.message}
        </div>
      )}

      {/* Cron setup hint */}
      <p className="text-xs text-muted-foreground border-t pt-2">
        Automatic processing: set up a cron job to call{" "}
        <code className="bg-muted px-1 rounded text-[10px]">POST /api/publishing/queue/process</code>{" "}
        with <code className="bg-muted px-1 rounded text-[10px]">Authorization: Bearer {"$"}{"{"}PUBLISH_QUEUE_SECRET{"}"}</code>
      </p>
    </div>
  );
}
