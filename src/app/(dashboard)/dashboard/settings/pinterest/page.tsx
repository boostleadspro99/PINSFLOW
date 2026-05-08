import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPinterestAccountByUserId } from "@/features/pinterest/queries/pinterest-account.queries";
import { PinterestConnectionCard } from "@/features/pinterest/components/PinterestConnectionCard";
import { PinterestBoardsTable } from "@/features/pinterest/components/PinterestBoardsTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function PinterestSettingsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const connected = params.connected === "true";
  const error = params.error || null;
  const errorDetails = params.details || null;

  const account = await getPinterestAccountByUserId(session.user.id);

  const errorMessages: Record<string, string> = {
    oauth_start_failed: "Could not start Pinterest OAuth. Please check your configuration and try again.",
    invalid_params: "Invalid OAuth callback parameters. Please try connecting again.",
    invalid_state: "OAuth state validation failed. This may be a security issue. Please try again.",
    connection_failed: "Failed to connect Pinterest account. Please check your Pinterest app configuration and try again.",
    token_exchange_failed: "Pinterest rejected the authorization code. Check that your Client ID, Client Secret, and Redirect URI match your Pinterest app configuration.",
    account_creation_failed: "Pinterest account created but failed to save. Check your Pinterest token encryption key and database connection.",
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="mb-4">
        <Button variant="ghost" asChild className="-ml-4 text-muted-foreground">
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Pinterest Integration"
        description="Connect your Pinterest account, sync boards, and manage your Pinterest connection."
      />

      {connected && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p>Pinterest account connected successfully! Sync your boards to get started.</p>
        </div>
      )}

      {error && errorMessages[error] && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p>{errorMessages[error]}</p>
            {errorDetails && (
              <p className="mt-1 text-xs text-red-600 font-mono break-all">
                {errorDetails}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        <PinterestConnectionCard account={account} />

        <Card>
          <CardHeader>
            <CardTitle>Synchronized Boards</CardTitle>
            <CardDescription>
              Boards synced from your Pinterest account. {account ? "Click Sync Boards to refresh." : "Connect your Pinterest account to sync boards."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {account && account.boards.length > 0 ? (
              <PinterestBoardsTable boards={account.boards} />
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-md">
                {account
                  ? "No boards synced yet. Click Sync Boards to fetch your Pinterest boards."
                  : "Connect your Pinterest account to sync boards."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon: Publishing</CardTitle>
            <CardDescription>
              Manual pin publishing will be implemented in a future phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Once publishing is available, you will be able to select a board and publish your
              approved pin drafts directly from PinFlow OS. You will also be able to schedule pins
              for future dates.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
