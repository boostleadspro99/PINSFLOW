"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle, XCircle } from "lucide-react";
import { generateBatchAction, type BatchResult } from "../actions/batch-publish.action";

interface GenerateBatchButtonProps {
  projectId: string;
  keywordId: string;
}

export function GenerateBatchButton({ projectId, keywordId }: GenerateBatchButtonProps) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);

  const handleBatch = async () => {
    setIsRunning(true);
    setResult(null);

    const res = await generateBatchAction(projectId, keywordId, 3);

    setResult(res);
    setIsRunning(false);
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <Button
        size="sm"
        onClick={handleBatch}
        disabled={isRunning}
        className="w-full"
      >
        {isRunning ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating batch...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Batch (3 pins)
          </>
        )}
      </Button>

      {isRunning && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="animate-pulse">⏳ Generating ideas...</p>
          <p className="animate-pulse">⏳ Creating drafts...</p>
          <p className="animate-pulse">⏳ Generating images...</p>
        </div>
      )}

      {result && !isRunning && (
        <div className={`text-xs p-3 rounded-md border ${
          result.success
            ? "bg-green-50 text-green-800 border-green-200"
            : "bg-red-50 text-red-800 border-red-200"
        }`}>
          <div className="font-medium mb-1">
            {result.success ? (
              <><CheckCircle className="h-3.5 w-3.5 inline mr-1" /> Batch completed</>
            ) : (
              <><XCircle className="h-3.5 w-3.5 inline mr-1" /> Batch failed</>
            )}
          </div>
          <div className="space-y-0.5">
            <p>✅ {result.ideasGenerated} ideas generated</p>
            <p>✅ {result.draftsCreated} drafts created</p>
            <p>✅ {result.imagesGenerated} images generated</p>
            <p>✅ {result.jobsQueued} jobs queued for publishing</p>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-2 text-red-600">
              <p className="font-medium">⚠️ {result.errors.length} errors:</p>
              <ul className="list-disc list-inside">
                {result.errors.slice(0, 3).map((e, i) => (
                  <li key={i} className="truncate">{e}</li>
                ))}
              </ul>
            </div>
          )}
          {result.error && !result.success && (
            <p className="mt-1">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
