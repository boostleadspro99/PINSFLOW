"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { createKeywordSchema, CreateKeywordInput } from "../schemas/keyword.schema";
import { createKeywordAction } from "../actions/keyword.actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface KeywordFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function KeywordForm({ projectId, onSuccess }: KeywordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateKeywordInput>({
    resolver: zodResolver(createKeywordSchema as any),
    defaultValues: {
      projectId,
      term: "",
    },
  });

  const onSubmit = async (data: CreateKeywordInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createKeywordAction(data);
      if (res.error) {
        setError(res.error);
      } else {
        form.reset({ projectId, term: "" });
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
      
      <div className="space-y-2">
        <Label htmlFor="term">Keyword / Phrase</Label>
        <Input id="term" {...form.register("term")} placeholder="e.g. minimalist home office" disabled={isSubmitting} />
        {form.formState.errors.term && <p className="text-sm text-red-500">{form.formState.errors.term.message as string}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="searchVolume">Search Volume (Optional)</Label>
          <Input id="searchVolume" type="number" {...form.register("searchVolume", { valueAsNumber: true })} disabled={isSubmitting} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty 0-100 (Optional)</Label>
          <Input id="difficulty" type="number" {...form.register("difficulty", { valueAsNumber: true })} disabled={isSubmitting} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding..." : "Add Keyword"}
      </Button>
    </form>
  );
}
