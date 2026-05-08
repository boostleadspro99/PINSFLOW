import { ContentIdea as PrismaContentIdea, ContentIdeaFormat, ContentIdeaStatus, Keyword } from "@prisma/client";

export type ContentIdea = PrismaContentIdea & { keyword?: Keyword };
export { ContentIdeaFormat, ContentIdeaStatus };
