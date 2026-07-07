"use client";

import Link from "next/link";
import { ChevronDown, UserIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export const DashboardUserButton = () => {
  const { data: session } = authClient.useSession();
  const accountLabel = session?.user?.name || session?.user?.name || "Account";
  const emailHint = session?.user?.email || "No email available";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="w-full justify-between gap-2">
          <div className="flex w-full items-center gap-2">
            <Link href="/account" className="flex flex-1 items-center gap-2">
              <UserIcon className="size-4" />
              <div className="flex flex-col items-start gap-0.5 text-left">
                <span className="truncate font-medium">{accountLabel}</span>
                <span className="text-xs text-sidebar-foreground/70">View account</span>
              </div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground gap-x-2">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  aria-label="Show account email"
                >
                  <ChevronDown className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right">
                <DropdownMenuItem className="cursor-default">
                  {emailHint}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
