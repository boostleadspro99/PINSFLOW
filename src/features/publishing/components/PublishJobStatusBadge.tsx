import { PublishJobStatus } from "@prisma/client";

const statusConfig: Record<PublishJobStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  QUEUED: { label: "Queued", className: "bg-sky-100 text-sky-800" },
  SENDING: { label: "Sending", className: "bg-blue-100 text-blue-800" },
  PUBLISHED: { label: "Published", className: "bg-green-100 text-green-800" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-800" },
};

export function PublishJobStatusBadge({ status }: { status: PublishJobStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
