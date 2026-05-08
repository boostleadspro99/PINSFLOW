import { PinAsset, PinDraft, Project } from "@prisma/client";

export type PinAssetWithRelations = PinAsset & {
  pinDraft?: PinDraft | null;
};

export type PinAssetWithDraftAndProject = PinAsset & {
  pinDraft?: (PinDraft & { project: Project }) | null;
};
