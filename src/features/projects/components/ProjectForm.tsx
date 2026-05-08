"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProjectSchema, updateProjectSchema, CreateProjectInput, UpdateProjectInput } from "../schemas/project.schema";
import { createProjectAction, updateProjectAction } from "../actions/project.actions";
import { Project } from "../types/project.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectFormProps {
  initialData?: Project;
}

export function ProjectForm({ initialData }: ProjectFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;
  const schema = isEditing ? updateProjectSchema : createProjectSchema;

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      language: initialData?.language || "en",
      country: initialData?.country || "US",
      targetAudience: initialData?.targetAudience || "",
      defaultWebsiteUrl: initialData?.defaultWebsiteUrl || "",
    },
  });

  const onSubmit = async (data: CreateProjectInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing) {
        const res = await updateProjectAction(initialData.id, data as UpdateProjectInput);
        if (res.error) {
          setError(res.error);
        } else {
          router.push(`/dashboard/projects/${initialData.id}`);
        }
      } else {
        const res = await createProjectAction(data);
        if (res.error) {
          setError(res.error);
        } else {
          router.push(`/dashboard/projects`);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <Card>
        <CardContent className="pt-6 space-y-4">
          {error && <div className="p-3 text-sm bg-red-100 text-red-600 rounded-md">{error}</div>}
          
          <div className="space-y-2">
            <Label htmlFor="name">Project Name <span className="text-red-500">*</span></Label>
            <Input id="name" {...form.register("name")} placeholder="e.g. Minimalist Lifestyle" disabled={isSubmitting} />
            {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              {...form.register("description")} 
              placeholder="What is this project about?" 
              disabled={isSubmitting}
              rows={3}
            />
            {form.formState.errors.description && <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input id="language" {...form.register("language")} disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...form.register("country")} disabled={isSubmitting} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input id="targetAudience" {...form.register("targetAudience")} placeholder="e.g. Women 25-40" disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultWebsiteUrl">Default Website URL</Label>
            <Input id="defaultWebsiteUrl" type="url" {...form.register("defaultWebsiteUrl")} placeholder="https://example.com" disabled={isSubmitting} />
            {form.formState.errors.defaultWebsiteUrl && <p className="text-sm text-red-500">{form.formState.errors.defaultWebsiteUrl.message}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
