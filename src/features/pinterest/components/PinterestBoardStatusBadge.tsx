import { BadgeCheck, Clock, AlertCircle, XCircle } from "lucide-react";
import type { PinterestAccountStatus as Status } from "@prisma/client";

interface PinterestBoardStatusBadgeProps {
  status: Status;
}

export function PinterestBoardStatusBadge({ status }: PinterestBoardStatusBadgeProps) {
  const config: Record<Status, { icon: typeof BadgeCheck; label: string; className: string }> = {
    CONNECTED: {
      icon: BadgeCheck,
      label: "Connected",
      className: "bg-green-100 text-green-700",
    },
    DISCONNECTED: {
      icon: XCircle,
      label: "Disconnected",
      className: "bg-gray-100 text-gray-500",
    },
    EXPIRED: {
      icon: Clock,
      label: "Expired",
      className: "bg-yellow-100 text-yellow-700",
    },
    ERROR: {
      icon: AlertCircle,
      label: "Error",
      className: "bg-red-100 text-red-700",
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
