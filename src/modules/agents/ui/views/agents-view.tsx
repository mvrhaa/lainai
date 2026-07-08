"use client";

import Link from "next/link";
import { BotIcon, ArrowRightIcon, PlusIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const AgentsView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Agents
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Your AI assistants
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Browse the agents you have created and open a conversation in one click.
          </p>
        </div>
        <Link href="/agents/new" className="shrink-0">
          <Button>
            <PlusIcon className="size-4" />
            New agent
          </Button>
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="mx-auto max-w-2xl">
          <Empty className="border-border bg-card text-left">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BotIcon className="size-6 text-primary" />
              </EmptyMedia>
              <EmptyTitle>No agents yet</EmptyTitle>
              <EmptyDescription>
                Create your first agent to begin building a conversational AI tailored to your workflow.
              </EmptyDescription>
            </EmptyHeader>
            <div className="mt-4 flex justify-center">
              <Link href="/agents/new">
                <Button>Start with a new agent</Button>
              </Link>
            </div>
          </Empty>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((agent) => (
            <li key={agent.id}>
              <Card className="h-full border-border bg-background shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-primary">
                      <BotIcon className="size-4" />
                      <h3 className="text-base font-semibold text-foreground">
                        {agent.name}
                      </h3>
                    </div>
                    <p className="line-clamp-4 text-sm text-muted-foreground">
                      {agent.instructions}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Link href={`/agents/${agent.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                      Open chat
                      <ArrowRightIcon className="size-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
