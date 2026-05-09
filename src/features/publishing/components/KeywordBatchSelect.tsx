"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GenerateBatchButton } from "./GenerateBatchButton";

interface KeywordInfo {
  id: string;
  term: string;
}

interface KeywordBatchSelectProps {
  keywords: KeywordInfo[];
  projectId: string;
}

export function KeywordBatchSelect({ keywords, projectId }: KeywordBatchSelectProps) {
  const [selectedKeywordId, setSelectedKeywordId] = useState("");

  return (
    <div className="space-y-3">
      <Select value={selectedKeywordId} onValueChange={setSelectedKeywordId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a keyword..." />
        </SelectTrigger>
        <SelectContent>
          {keywords.map((kw) => (
            <SelectItem key={kw.id} value={kw.id}>
              {kw.term}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedKeywordId && (
        <GenerateBatchButton projectId={projectId} keywordId={selectedKeywordId} />
      )}
    </div>
  );
}
