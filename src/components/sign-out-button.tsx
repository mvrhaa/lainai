"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface SignOutButtonProps {
  /** Where to send the user after signing out. @default "/sign-in" */
  redirectTo?: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
  className?: string;
}

export const SignOutButton = ({
  redirectTo = "/sign-in",
  variant = "outline",
  className,
}: SignOutButtonProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authClient.signOut();
    } finally {
      // hard refresh so server components re-run with the cleared cookie
      router.push(redirectTo);
      router.refresh();
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      disabled={loading}
      className={className}
    >
      <LogOut className="mr-2 size-4" />
      {loading ? "Signing out…" : "Sign out"}
    </Button>
  );
};
