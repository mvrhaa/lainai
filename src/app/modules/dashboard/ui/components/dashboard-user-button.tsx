"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, Mail, UserCog } from "lucide-react";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "?";
  return source
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const DashboardUserButton = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);

  const user = session?.user;
  if (!user) return null;

  const accountLabel = user.name || user.email || "Account";
  const emailHint = user.email || "No email available";
  const initials = getInitials(user.name, user.email);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/sign-in");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="h-auto w-full justify-between gap-2 py-2">
              <div className="flex flex-1 items-center gap-2 overflow-hidden">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={accountLabel}
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </span>
                <div className="flex min-w-0 flex-col items-start text-left">
                  <span className="truncate text-sm font-medium">
                    {accountLabel}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/70">
                    View account
                  </span>
                </div>
              </div>
              <ChevronDown className="size-4 shrink-0 text-sidebar-foreground/70" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium">{accountLabel}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {emailHint}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account">
                <UserCog className="mr-2 size-4" />
                Account settings
              </Link>
            </DropdownMenuItem>
            {user.email && (
              <DropdownMenuItem asChild>
                <a href={`mailto:${user.email}`}>
                  <Mail className="mr-2 size-4" />
                  Email support
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              {signingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
