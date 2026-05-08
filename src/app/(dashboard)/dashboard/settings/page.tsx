import { Settings, User, Key, Pin, Brain, LayoutList } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <PageHeader 
        title="Settings" 
        description="Manage your account, preferences, and integrations." 
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Account Profile
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Account settings will be implemented in a future phase.
            </p>
            <Button disabled variant="outline">Edit Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pin className="h-5 w-5" /> Pinterest Integration
            </CardTitle>
            <CardDescription>
              Connect your Pinterest account to enable publishing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure OAuth and connect to Pinterest. Support for automated publishing.
            </p>
            <Button asChild>
              <Link href="/dashboard/settings/pinterest">Manage Connection</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutList className="h-5 w-5" /> Publish Boards
            </CardTitle>
            <CardDescription>
              Save your Pinterest boards for publishing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manually add the Pinterest boards you want to publish to via Make.com.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/settings/boards">Manage Boards</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" /> AI Models
            </CardTitle>
            <CardDescription>
              Choose which AI model is used for each task
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure models for content ideas, pin drafts, and image prompts per project.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard/settings/ai">Configure AI</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" /> API Keys & Billing
            </CardTitle>
            <CardDescription>
              Manage quotas and external API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Billing and API limits will be available once the AI modules are active.
            </p>
            <Button disabled variant="outline">Manage Billing</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
