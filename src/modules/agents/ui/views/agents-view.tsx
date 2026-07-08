"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRightIcon,
  BotIcon,
  LockIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon,
} from "lucide-react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const AgentsView = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

  // data[0] is the user's oldest agent — the protected main agent
  // (the delete procedure enforces this server-side too).
  const mainId = data[0]?.id;

  const [deleteTarget, setDeleteTarget] = useState<
    { id: string; name: string } | null
  >(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const deleteAgent = useMutation(
    trpc.agents.delete.mutationOptions({
      onSuccess: async () => {
        setRemoving(null);
        toast.success("Agent deleted");
        await queryClient.invalidateQueries({
          queryKey: trpc.agents.getMany.queryKey(),
        });
      },
      onError: (error) => {
        setRemoving(null);
        toast.error(error.message || "Could not delete this agent.");
      },
    }),
  );

  const confirmDelete = () => {
    const target = deleteTarget;
    if (!target) return;
    setDeleteTarget(null);
    // Let the exit animation play before the row is removed from the list.
    setRemoving(target.id);
    window.setTimeout(() => {
      deleteAgent.mutate({ id: target.id });
    }, 220);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
      <div className="mb-6 flex flex-col gap-4 animate-fade-in-up sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Agents
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Your AI assistants
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Browse the agents you have created and open a conversation in one
            click. Your <span className="font-medium text-foreground">main agent</span> is permanent;
            the rest can be created and removed anytime.
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
        <div className="mx-auto max-w-2xl animate-scale-in">
          <Empty className="border-border bg-card text-left">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BotIcon className="size-6 text-primary" />
              </EmptyMedia>
              <EmptyTitle>No agents yet</EmptyTitle>
              <EmptyDescription>
                Create your first agent to begin building a conversational AI
                tailored to your workflow.
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
          {data.map((agent, index) => {
            const isMain = agent.id === mainId;
            return (
              <li
                key={agent.id}
                style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                className={cn(
                  "animate-card-enter",
                  removing === agent.id && "animate-card-exit",
                )}
              >
                <Card className="group relative h-full overflow-hidden border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-cyan-400/15 text-sm font-semibold text-primary">
                          {initialsOf(agent.name)}
                        </span>
                        <div className="flex min-w-0 items-center gap-2">
                          <h3 className="truncate text-base font-semibold text-foreground">
                            {agent.name}
                          </h3>
                          {isMain ? (
                            <Badge
                              variant="secondary"
                              className="shrink-0 gap-1 bg-primary/10 text-primary [&_svg]:size-3"
                            >
                              <ShieldIcon />
                              Main
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      <p className="line-clamp-4 text-sm text-muted-foreground">
                        {agent.instructions}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Link
                        href={`/agents/${agent.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all hover:gap-2.5 hover:text-primary/80"
                      >
                        Open chat
                        <ArrowRightIcon className="size-3.5" />
                      </Link>

                      {isMain ? (
                        <span
                          title="Your main agent is permanent and cannot be deleted."
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                        >
                          <LockIcon className="size-3.5" />
                          Protected
                        </span>
                      ) : (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Delete agent"
                          aria-label={`Delete ${agent.name}`}
                          className="text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          onClick={() =>
                            setDeleteTarget({ id: agent.id, name: agent.name })
                          }
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this agent?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              and all of its chats. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteAgent.isPending}
            >
              {deleteAgent.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};