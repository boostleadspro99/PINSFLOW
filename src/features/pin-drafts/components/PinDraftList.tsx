import { PinDraftWithRelations } from "../types/pin-draft.types";
import { PinDraftCard } from "./PinDraftCard";

export function PinDraftList({ projectId, pinDrafts }: { projectId: string; pinDrafts: PinDraftWithRelations[] }) {
  if (pinDrafts.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No pin drafts found.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pinDrafts.map((pinDraft) => (
        <PinDraftCard key={pinDraft.id} pinDraft={pinDraft} projectId={projectId} />
      ))}
    </div>
  );
}
