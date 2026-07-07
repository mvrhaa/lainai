"use client";
import { authClient } from "@/lib/auth-client";
import { UserGreeting } from "@/components/ui/user-greeting";
import { SignOutButton } from "@/components/sign-out-button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  const { data: session } = authClient.useSession();

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardDescription>Signed in as</CardDescription>
            <UserGreeting showEmail />
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-sm">{session?.user?.name ?? "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm">{session?.user?.email ?? "—"}</p>
          </div>
          <Separator />
          <div className="flex justify-end">
            <SignOutButton variant="destructive" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
