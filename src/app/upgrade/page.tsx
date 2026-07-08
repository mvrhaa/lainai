import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UpgradePage() {
  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <Card className="rounded-3xl border-border bg-card shadow-sm">
        <CardHeader className="space-y-3 p-6">
          <CardTitle>Upgrade coming soon</CardTitle>
          <CardDescription>
            We&apos;re working on premium features to help you get even more from your AI agents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            The upgrade experience will include advanced agent workflows, richer analytics, and tailored
            support. For now you can continue using your existing agents and conversations.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/agents" className="inline-block">
              <Button>View agents</Button>
            </Link>
            <Link href="/" className="inline-block">
              <Button variant="outline">Back to dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
