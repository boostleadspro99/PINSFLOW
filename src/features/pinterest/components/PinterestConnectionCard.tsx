import { Pin, ShieldAlert, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectPinterestButton } from "./ConnectPinterestButton";
import { DisconnectPinterestButton } from "./DisconnectPinterestButton";
import { SyncPinterestBoardsButton } from "./SyncPinterestBoardsButton";
import type { PinterestAccountStatus as Status } from "@prisma/client";

interface PinterestConnectionCardProps {
  account: {
    id: string;
    username: string;
    displayName: string | null;
    status: Status;
    scopes: string;
    createdAt: Date;
  } | null;
}

export function PinterestConnectionCard({ account }: PinterestConnectionCardProps) {
  if (!account || account.status === "DISCONNECTED") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pin className="h-5 w-5 text-red-500" /> Connect Account
          </CardTitle>
          <CardDescription>
            Link your Pinterest account via OAuth to sync boards and enable publishing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4 flex gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Security Notice</p>
              <p className="text-muted-foreground mt-1">
                We use official Pinterest OAuth. We will never ask for or store your Pinterest password.
                You can revoke access at any time from your Pinterest account settings.
              </p>
            </div>
          </div>
          <ConnectPinterestButton />
        </CardContent>
      </Card>
    );
  }

  const isExpired = account.status === "EXPIRED";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pin className={`h-5 w-5 ${isExpired ? "text-yellow-500" : "text-green-500"}`} />
          {isExpired ? "Account Expired" : "Connected Account"}
        </CardTitle>
        <CardDescription>
          {isExpired
            ? "Your Pinterest token has expired. Please reconnect to continue."
            : "Your Pinterest account is connected and linked to PinFlow OS."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isExpired && (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4 flex items-start gap-3">
            <RefreshCw className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Token expired</p>
              <p className="mt-1">
                Your Pinterest access token has expired. Click the button below to reconnect your account.
              </p>
            </div>
          </div>
        )}
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Username</span>
            <span className="font-medium">{account.username}</span>
          </div>
          {account.displayName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Display Name</span>
              <span className="font-medium">{account.displayName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={account.status} />
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Scopes</span>
            <span className="font-medium text-xs">{account.scopes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Connected</span>
            <span className="font-medium">{account.createdAt.toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          {isExpired ? (
            <ConnectPinterestButton />
          ) : (
            <SyncPinterestBoardsButton accountId={account.id} />
          )}
          <DisconnectPinterestButton accountId={account.id} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const colors: Record<Status, string> = {
    CONNECTED: "bg-green-100 text-green-700",
    DISCONNECTED: "bg-gray-100 text-gray-500",
    EXPIRED: "bg-yellow-100 text-yellow-700",
    ERROR: "bg-red-100 text-red-700",
  };

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status]}`}>
      {status}
    </span>
  );
}
