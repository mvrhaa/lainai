"use client";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <div className="animate-fade-in-up p-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      <div className="mt-4 rounded-xl border border-border bg-background p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">Logged in as</p>
        <p className="mt-1 text-lg font-medium">{session?.user?.name || session?.user?.email || "Unknown user"}</p>
        <p className="mt-2 text-sm text-muted-foreground">{session?.user?.email}</p>
        <div className="mt-4">
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
