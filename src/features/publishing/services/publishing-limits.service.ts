import { prisma } from "@/lib/prisma";
import { PublishJobStatus } from "@prisma/client";
import { systemLimits } from "@/config/limits";

export interface LimitCheckResult {
  allowed: boolean;
  error?: string;
}

/**
 * Check daily publish limit for a project.
 * Returns an error if the project has exceeded MAX_PUBLISHES_PER_DAY_PER_PROJECT.
 */
export async function checkProjectDailyLimit(projectId: string): Promise<LimitCheckResult> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const count = await prisma.publishJob.count({
    where: {
      projectId,
      status: PublishJobStatus.PUBLISHED,
      publishedAt: { gte: since },
    },
  });

  if (count >= systemLimits.MAX_PUBLISHES_PER_DAY_PER_PROJECT) {
    return {
      allowed: false,
      error: `Daily publish limit reached for this project (${systemLimits.MAX_PUBLISHES_PER_DAY_PER_PROJECT} per day). Please try again tomorrow.`,
    };
  }

  return { allowed: true };
}

/**
 * Check hourly publish limit for a Pinterest account (per userId for MVP).
 * Returns an error if the account has exceeded MAX_PUBLISHES_PER_HOUR_PER_ACCOUNT.
 */
export async function checkAccountHourlyLimit(userId: string): Promise<LimitCheckResult> {
  const since = new Date(Date.now() - 60 * 60 * 1000);

  const count = await prisma.publishJob.count({
    where: {
      userId,
      status: PublishJobStatus.PUBLISHED,
      publishedAt: { gte: since },
    },
  });

  if (count >= systemLimits.MAX_PUBLISHES_PER_HOUR_PER_ACCOUNT) {
    const retryAfter = new Date(Date.now() + 60 * 60 * 1000);
    return {
      allowed: false,
      error: `Hourly publish limit reached (${systemLimits.MAX_PUBLISHES_PER_HOUR_PER_ACCOUNT} per hour). Next window opens at ${retryAfter.toLocaleTimeString()}.`,
    };
  }

  return { allowed: true };
}
