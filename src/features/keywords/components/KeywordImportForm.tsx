"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { importKeywordsSchema, ImportKeywordsInput } from "../schemas/keyword.schema";
import { importKeywordsAction } from "../actions/keyword.actions";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface KeywordImportFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function KeywordImportForm({ projectId, onSuccess }: KeywordImportFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ImportKeywordsInput>({
    resolver: zodResolver(importKeywordsSchema as any),
    defaultValues: {
      projectId,
      text: "",
    },
  });

  const onSubmit = async (data: ImportKeywordsInput) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await importKeywordsAction(data);
      if (res.error) {
        setError(res.error);
      } else {
        form.reset({ projectId, text: "" });
        setSuccessMsg(`Import successful! Added: ${res.added}. Duplicates skipped: ${res.duplicates}. Invalid skipped: ${res.skipped}.`);
        onSuccess?.();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && <div className="p-3 text-sm bg-red-100 text-red-600 rounded-md">{error}</div>}
      {successMsg && <div className="p-3 text-sm bg-green-100 text-green-700 rounded-md">{successMsg}</div>}
      
      <div className="space-y-2">
        <Label htmlFor="text">Paste Keywords (one per line, or comma separated)</Label>
        <Textarea 
          id="text" 
          {...form.register("text")} 
          placeholder={"home decor\nminimalist living\nplant care"} 
          disabled={isSubmitting}
          rows={6}
        />
        {form.formState.errors.text && <p className="text-sm text-red-500">{form.formState.errors.text.message as string}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Importing..." : "Bulk Import Keywords"}
      </Button>
    </form>
  );
}
