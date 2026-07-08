"use client";

import { useState } from "react";
import { LogOut, ChevronDown, Mail, User as UserIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface UserGreetingProps {
  /**
   * What to show before the username.
   * @default "Hello"
   */
  greeting?: string;
  /**
   * Show the email underneath the name.
   * @default false
   */
  showEmail?: boolean;
  /**
   * Show a sign-out action in the dropdown.
   * @default true
   */
  showSignOut?: boolean;
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "?";
  return source
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const UserGreeting = ({
  showEmail = false,
  showSignOut = true,
}: UserGreetingProps) => {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  if (!session?.user) return null;

  const user = session.user;
  const displayName = user.name || user.email || "there";
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto gap-2 rounded-full px-2 py-1.5 hover:bg-muted"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={displayName}
                className="size-8 rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-medium">
                {user.name ? `@${user.name}` : displayName}
            </span>
            {showEmail && user.email && (
            <span className="text-xs text-muted-foreground">
                {user.email}
            </span>
            )}
        </span>

          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">
              {user.name || "Unnamed user"}
            </p>
            {user.email && (
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="opacity-100">
          <UserIcon className="mr-2 size-4" />
          <span className="truncate">Signed in</span>
        </DropdownMenuItem>
        {user.email && (
          <DropdownMenuItem asChild>
            <a href={`mailto:${user.email}`}>
              <Mail className="mr-2 size-4" />
              Email
            </a>
          </DropdownMenuItem>
        )}
        {showSignOut && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              {signingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
