import { PublishJob, PublishJobStatus, PublishProvider } from "@prisma/client";

export type PublishJobWithRelations = PublishJob & {
  pinDraft: { title: string };
};

export type { PublishJobStatus, PublishProvider };
