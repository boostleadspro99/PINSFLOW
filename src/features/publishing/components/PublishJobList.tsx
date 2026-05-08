import { PublishJobWithRelations } from "../types/publishing.types";
import { PublishJobStatusBadge } from "./PublishJobStatusBadge";

function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  return new Date(date).toLocaleString();
}

function isScheduledFuture(scheduledAt: Date | string | null | undefined): boolean {
  if (!scheduledAt) return false;
  return new Date(scheduledAt).getTime() > Date.now();
}

export function PublishJobList({ jobs }: { jobs: PublishJobWithRelations[] }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No publish jobs yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="rounded-lg border p-4 flex items-center justify-between"
        >
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {job.pinDraft?.title ?? "Unknown pin"}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span>Board: {job.boardName ?? job.boardId}</span>
              <span>•</span>
              <span>{job.provider}</span>
              {isScheduledFuture(job.scheduledAt) && (
                <>
                  <span>•</span>
                  <span>Scheduled: {formatDate(job.scheduledAt)}</span>
                </>
              )}
              {job.queuedAt && (
                <>
                  <span>•</span>
                  <span>Queued: {formatDate(job.queuedAt)}</span>
                </>
              )}
              {job.publishedAt && (
                <>
                  <span>•</span>
                  <span>Published: {formatDate(job.publishedAt)}</span>
                </>
              )}
              {(job.attemptCount ?? 0) > 0 && (
                <>
                  <span>•</span>
                  <span>Attempt {job.attemptCount}/{job.maxAttempts ?? 3}</span>
                </>
              )}
            </div>
            {job.errorMessage && (
              <p className="text-xs text-red-600 truncate max-w-md">
                Error: {job.errorMessage}
              </p>
            )}
            {job.externalUrl && (
              <a
                href={job.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline block truncate"
              >
                View on Pinterest →
              </a>
            )}
          </div>
          <div className="flex-shrink-0 ml-4">
            <PublishJobStatusBadge status={job.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
