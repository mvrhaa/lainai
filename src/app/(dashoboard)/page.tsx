"use client";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

export default function DashboardHomePage() {
  const { data: session } = authClient.useSession();
  const displayName = session?.user?.name ?? session?.user?.email ?? "there";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <Card className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-2xl shadow-violet-500/10">
        <CardHeader className="space-y-6 p-8 sm:p-10">
          <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70 shadow-sm shadow-white/5">
            Agent workspace
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Welcome back, {displayName}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Your workspace is ready. Browse your agents or create a new conversational assistant in a clean, focused experience.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/agents" className="block">
              <Button className="w-full bg-white text-slate-950 hover:bg-white/90">Browse agents</Button>
            </Link>
            <Link href="/agents/new" className="block">
              <Button variant="outline" className="w-full bg-white border-white/15 text-slate-950 hover:bg-white/90">
                Create new agent
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
