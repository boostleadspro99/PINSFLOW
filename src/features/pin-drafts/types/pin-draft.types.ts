import { PinDraft, PinDraftStatus, Keyword, ContentIdea, PinAsset } from "@prisma/client";

export type PinDraftWithRelations = PinDraft & {
  keyword: Keyword;
  contentIdea?: ContentIdea | null;
  pinAsset?: PinAsset | null;
};

export { PinDraftStatus };
