"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  BarChart,
  Settings,
  Menu,
} from "lucide-react";
import ProjectSwitcherPlaceholder from "@/components/dashboard/ProjectSwitcherPlaceholder";

interface DashboardSidebarProps {
  className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/dashboard/projects", icon: FolderOpen },
    { name: "Calendar", href: "/dashboard/projects/demo/calendar", icon: Calendar, disabled: true },
    { name: "Analytics", href: "/dashboard/projects/demo/analytics", icon: BarChart, disabled: true },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-muted/40", className)}>
      <div className="p-4 border-b">
        <ProjectSwitcherPlaceholder />
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {item.disabled && (
                <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded border">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          System Status
        </div>
      </div>
    </div>
  );
}
