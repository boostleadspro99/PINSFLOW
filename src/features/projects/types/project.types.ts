import { Project, ProjectStatus } from "@prisma/client";

export type { Project };
export { ProjectStatus };

export interface ProjectRouteParams {
  projectId: string;
}
