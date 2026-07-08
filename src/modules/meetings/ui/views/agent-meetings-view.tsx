"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ClockIcon,
  MessageSquareIcon,
  PlusIcon,
  ShieldIcon,
  TrashIcon,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { cn } from "@/lib/utils";

interface Props {
  agentId: string;
}

function formatUpdated(value: unknown): string {
  try {
    return new Date(value as string).toLocaleString();
  } catch {
    return "—";
  }
}

export const AgentMeetingsView = ({ agentId }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<
    { id: string; name: string } | null
  >(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const agentQuery = useQuery(trpc.agents.getOne.queryOptions({ id: agentId }));
  const meetingsQuery = useQuery(
    trpc.meetings.getMany.queryOptions({ agentId }),
  );
  // Used to flag this agent as the protected main agent in the header.
  const agentsQuery = useQuery(trpc.agents.getMany.queryOptions());
  const isMain = agentsQuery.data?.[0]?.id === agentId;

  const createMeeting = useMutation(
    trpc.meetings.create.mutationOptions({
      onSuccess: async (meeting) => {
        setName("");
        toast.success("New chat started");
        await queryClient.invalidateQueries({
          queryKey: trpc.meetings.getMany.queryKey({ agentId }),
        });
        router.push(`/agents/${agentId}/chat/${meeting.id}`);
      },
      onError: (e) => toast.error(e.message || "Could not start a new chat."),
    }),
  );

  const deleteMeeting = useMutation(
    trpc.meetings.delete.mutationOptions({
      onSuccess: async () => {
        setRemoving(null);
        toast.success("Chat deleted");
        await queryClient.invalidateQueries({
          queryKey: trpc.meetings.getMany.queryKey({ agentId }),
        });
      },
      onError: (e) => {
        setRemoving(null);
        toast.error(e.message || "Could not delete this chat.");
      },
    }),
  );

  const confirmDelete = () => {
    const target = deleteTarget;
    if (!target) return;
    setDeleteTarget(null);
    setRemoving(target.id);
    window.setTimeout(() => {
      deleteMeeting.mutate({ id: target.id });
    }, 220);
  };

  if (agentQuery.isError) {
    return (
      <div className="animate-fade-in p-8 text-sm text-muted-foreground">
        This agent couldn&rsquo;t be found. It may have been deleted.
      </div>
    );
  }

  const meetings = meetingsQuery.data ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border bg-background px-6 py-4 animate-fade-in-up">
        <Link
          href="/agents"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          All agents
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <h1 className="text-3xl font-semibold text-foreground">
            {agentQuery.data?.name ?? "Loading…"}
          </h1>
          {isMain ? (
            <Badge
              variant="secondary"
              className="gap-1 bg-primary/10 text-primary [&_svg]:size-3"
            >
              <ShieldIcon />
              Main
            </Badge>
          ) : null}
        </div>
        {agentQuery.data?.instructions ? (
          <p className="mt-2 max-w-2xl line-clamp-3 text-sm text-muted-foreground">
            {agentQuery.data.instructions}
          </p>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Start a new chat */}
          <Card className="animate-fade-in-up rounded-3xl border-border bg-card shadow-sm">
            <CardHeader className="p-6">
              <CardTitle className="flex items-center gap-2">
                <PlusIcon className="size-4 text-primary" />
                Start a new chat
              </CardTitle>
              <CardDescription>
                Give this session an optional title, then start the
                conversation.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createMeeting.mutate({
                    agentId,
                    name: name.trim() || undefined,
                  });
                }}
                className="grid gap-4"
              >
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional chat title"
                  disabled={createMeeting.isPending}
                />
                <Button
                  type="submit"
                  disabled={createMeeting.isPending}
                  className="gap-1.5"
                >
                  {createMeeting.isPending ? (
                    "Creating…"
                  ) : (
                    <>
                      <MessageSquareIcon className="size-4" />
                      New chat
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Previous chats */}
          <Card className="animate-fade-in-up rounded-3xl border-border bg-card shadow-sm">
            <CardHeader className="p-6">
              <CardTitle>Previous chats</CardTitle>
              <CardDescription>
                Pick up an earlier conversation with this agent.
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              {meetingsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : meetings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No chats yet — start one to the left.
                </p>
              ) : (
                <ul className="space-y-2">
                  {meetings.map((m, index) => (
                    <li
                      key={m.id}
                      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
                      className={cn(
                        "animate-card-enter",
                        removing === m.id && "animate-card-exit",
                      )}
                    >
                      <Link
                        href={`/agents/${agentId}/chat/${m.id}`}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-all hover:border-primary/40 hover:bg-muted hover:shadow-sm"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-foreground">
                            {m.name}
                          </span>
                          <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <ClockIcon className="size-3" />
                            Updated {formatUpdated(m.updatedAt)}
                          </span>
                        </span>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Delete chat"
                          aria-label={`Delete ${m.name}`}
                          className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteTarget({ id: m.id, name: m.name });
                          }}
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMeeting.isPending}
            >
              {deleteMeeting.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};