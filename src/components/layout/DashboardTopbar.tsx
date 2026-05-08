"use client";

import { Pin } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import UserMenuPlaceholder from "@/components/dashboard/UserMenuPlaceholder";

interface DashboardTopbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardTopbar({ user }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 sm:max-w-xs">
            <nav className="flex h-14 items-center border-b px-4 font-semibold">
              <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight text-primary">
                <Pin className="h-5 w-5 text-primary" />
                PinFlow OS
              </Link>
            </nav>
            <DashboardSidebar className="border-r-0" />
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:flex h-14 items-center font-semibold">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight text-primary">
          <Pin className="h-5 w-5 text-primary" />
          PinFlow OS
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-end">
        {user && <UserMenuPlaceholder user={user} />}
      </div>
    </header>
  );
}
