import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  FolderOpen,
  FileText,
  CalendarClock,
  Send,
  Pin,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface StatCard {
  title: string;
  value: string;
  icon: typeof FolderOpen;
  desc: string;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [
    totalProjects,
    draftPins,
    scheduledPins,
    publishedPins,
    pinterestAccount,
  ] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.pinDraft.count({ where: { project: { userId }, status: "DRAFT" } }),
    prisma.publishJob.count({ where: { userId, status: "PENDING" } }),
    prisma.publishJob.count({ where: { userId, status: "PUBLISHED" } }),
    prisma.pinterestAccount.findUnique({ where: { userId } }),
  ]);

  const pinterestStatus =
    pinterestAccount?.status === "CONNECTED" ? "Connected" : "Not Connected";

  const stats: StatCard[] = [
    { title: "Total Projects", value: String(totalProjects), icon: FolderOpen, desc: "Active marketing projects" },
    { title: "Draft Pins", value: String(draftPins), icon: FileText, desc: "Awaiting approval or generation" },
    { title: "Scheduled Pins", value: String(scheduledPins), icon: CalendarClock, desc: "In queue for publishing" },
    { title: "Published Pins", value: String(publishedPins), icon: Send, desc: "Successfully published" },
    { title: "Pinterest Status", value: pinterestStatus, icon: Pin, desc: "Action required in settings" },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8">
      <PageHeader
        title="Dashboard Overview"
        description="Welcome to PinFlow OS. Here is a summary of your activity."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-8">
        <h2 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" /> Recent Activity
        </h2>
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <EmptyState
              icon={Activity}
              title="No recent activity"
              description="Real data will appear after the Projects, Pins, and Analytics modules are implemented in future phases."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
