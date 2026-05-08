"use client";

import { useState } from "react";
import Link from "next/link";
import { Keyword, KeywordStatus } from "../types/keyword.types";
import { updateKeywordStatusAction } from "../actions/keyword.actions";
import { KeywordStatusBadge } from "./KeywordStatusBadge";
import { KeywordSourceBadge } from "./KeywordSourceBadge";
import { GenerateIdeasButton } from "@/features/content-ideas/components/GenerateIdeasButton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Check, X, Archive, Play, RefreshCw, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

interface KeywordListProps {
  projectId: string;
  keywords: Keyword[];
}

export function KeywordList({ projectId, keywords }: KeywordListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (keywordId: string, status: KeywordStatus) => {
    setLoadingId(keywordId);
    try {
      await updateKeywordStatusAction({ projectId, keywordId, status });
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingId(null);
    }
  };

  if (!keywords.length) {
    return (
      <EmptyState 
        title="No keywords found" 
        description="Add your first keywords manually or import a list to get started."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Keyword</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Volume</TableHead>
            <TableHead className="text-right">Difficulty</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keywords.map((kw) => (
            <TableRow key={kw.id}>
              <TableCell className="font-medium">{kw.term}</TableCell>
              <TableCell><KeywordStatusBadge status={kw.status} /></TableCell>
              <TableCell><KeywordSourceBadge source={kw.source} /></TableCell>
              <TableCell className="text-right text-muted-foreground">{kw.searchVolume || "-"}</TableCell>
              <TableCell className="text-right text-muted-foreground">{kw.difficulty || "-"}</TableCell>
              <TableCell className="text-right flex items-center justify-end gap-2">
                <GenerateIdeasButton projectId={projectId} keywordId={kw.id} variant="secondary" size="sm" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={loadingId === kw.id}>
                      <span className="sr-only">Open menu</span>
                      {loadingId === kw.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {kw.status !== "NEW" && (
                      <DropdownMenuItem onClick={() => handleStatusChange(kw.id, "NEW")}>
                        <Play className="mr-2 h-4 w-4" /> Mark New
                      </DropdownMenuItem>
                    )}
                    {kw.status !== "USED" && (
                      <DropdownMenuItem onClick={() => handleStatusChange(kw.id, "USED")}>
                        <Check className="mr-2 h-4 w-4" /> Mark Used
                      </DropdownMenuItem>
                    )}
                    {kw.status !== "IGNORED" && (
                      <DropdownMenuItem onClick={() => handleStatusChange(kw.id, "IGNORED")}>
                        <X className="mr-2 h-4 w-4" /> Mark Ignored
                      </DropdownMenuItem>
                    )}
                    {kw.status !== "ARCHIVED" && (
                      <DropdownMenuItem onClick={() => handleStatusChange(kw.id, "ARCHIVED")}>
                        <Archive className="mr-2 h-4 w-4" /> Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                       <Link href={`/dashboard/projects/${projectId}/ideas`} className="w-full cursor-pointer flex items-center">
                         <Sparkles className="mr-2 h-4 w-4" /> View Ideas
                       </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
