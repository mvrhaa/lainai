"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon, BotIcon, ClockIcon, MessageSquareIcon, PlusIcon, SparklesIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function DashboardHomePage() {
  const { data: session } = authClient.useSession();
  const displayName = session?.user?.name ?? session?.user?.email ?? "there";

  const trpc = useTRPC();
  const agentsQuery = useQuery(trpc.agents.getMany.queryOptions());
  const meetingsQuery = useQuery(trpc.meetings.search.queryOptions({}));

  const agents = agentsQuery.data ?? [];
  const meetings = meetingsQuery.data ?? [];
  const mainAgent = agents[0];
  const recent = meetings.slice(0, 4);
  const agentName = (id: string) =>
    agents.find((a) => a.id === id)?.name ?? "Agent";

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="mx-auto w-full max-w-6xl animate-fade-in-up space-y-6 p-6">
        {/* Hero */}
        <Card className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-violet-500/10">
          <div className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-violet-500/20 blur-3xl animate-float-slow" />
          <div className="pointer-events-none absolute -right-10 top-10 size-56 rounded-full bg-cyan-400/20 blur-3xl animate-float" />
          <CardHeader className="relative space-y-6 p-8 sm:p-10">
            <div className="inline-flex w-fit animate-fade-in items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70 shadow-sm shadow-white/5">
              <SparklesIcon className="size-3.5" />
              Agent workspace
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Welcome back,{" "}
                <span className="text-gradient-anim">{displayName}</span>
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
                Your workspace is ready. Browse your agents or create a new
                conversational assistant in a clean, focused experience.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/agents" className="block">
                <Button className="w-full gap-2 bg-white text-slate-950 hover:bg-white/90">
                  <BotIcon className="size-4" />
                  Browse agents
                </Button>
              </Link>
              <Link href="/agents/new" className="block">
                <Button
                  variant="outline"
                  className="w-full gap-2 border-white/15 bg-white text-slate-950 hover:bg-white/90"
                >
                  <PlusIcon className="size-4" />
                  Create new agent
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Agents"
            value={agentsQuery.isLoading ? "—" : String(agents.length)}
            icon={<BotIcon className="size-5 text-primary" />}
            href="/agents"
            hint="Browse all"
          />
          <StatCard
            label="Chats"
            value={meetingsQuery.isLoading ? "—" : String(meetings.length)}
            icon={<MessageSquareIcon className="size-5 text-primary" />}
            href="/agents"
            hint="Open a chat"
          />
        </div>

        {/* Main agent + recent activity */}
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Card className="overflow-hidden rounded-3xl border-border bg-card shadow-sm">
            <CardHeader className="space-y-3 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Your main agent
              </p>
              {mainAgent ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-cyan-400/15 text-sm font-semibold text-primary">
                      {mainAgent.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-foreground">
                        {mainAgent.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Always available · can&apos;t be deleted
                      </div>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {mainAgent.instructions}
                  </p>
                  <Link
                    href={`/agents/${mainAgent.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all hover:gap-2.5"
                  >
                    Open chat <ArrowRightIcon className="size-3.5" />
                  </Link>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Loading your main agent…
                </p>
              )}
            </CardHeader>
          </Card>

          <Card className="overflow-hidden rounded-3xl border-border bg-card shadow-sm">
            <CardHeader className="space-y-3 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Pick up where you left off
              </p>
              {recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No chats yet — open an agent to start one.
                </p>
              ) : (
                <ul className="space-y-1">
                  {recent.map((m, i) => (
                    <li
                      key={m.id}
                      style={{ animationDelay: `${i * 60}ms` }}
                      className="animate-card-enter"
                    >
                      <Link
                        href={`/agents/${m.agentId}/chat/${m.id}`}
                        className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {m.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            with {agentName(m.agentId)}
                          </span>
                        </span>
                        <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  href: string;
  hint: string;
}) {
  return (
    <Link href={href} className="block">
      <Card
        className={cn(
          "group rounded-3xl border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
        )}
      >
        <CardHeader className="flex-row items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
              {icon}
            </span>
            <div>
              <div className="text-3xl font-semibold tracking-tight text-foreground">
                {value}
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {label}
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-primary">
            <ClockIcon className="size-3.5" />
            {hint}
          </span>
        </CardHeader>
      </Card>
    </Link>
  );
}