"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Props {
  agentId: string;
}

export const AgentMeetingsView = ({ agentId }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [name, setName] = useState("");

  const agentQuery = useQuery(trpc.agents.getOne.queryOptions({ id: agentId }));
  const meetingsQuery = useQuery(trpc.meetings.getMany.queryOptions({ agentId }));

  const createMeeting = useMutation(
    trpc.meetings.create.mutationOptions({
      onSuccess: async (meeting) => {
        setName("");
        await queryClient.invalidateQueries({
          queryKey: trpc.meetings.getMany.queryKey({ agentId }),
        });
        router.push(`/agents/${agentId}/chat/${meeting.id}`);
      },
    }),
  );

  if (agentQuery.isError) {
    return (
      <div className="p-8 text-sm text-muted-foreground">
        This agent couldn&rsquo;t be found. It may have been deleted.
      </div>
    );
  }

  const meetings = meetingsQuery.data ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border bg-background px-6 py-4">
        <Link href="/agents" className="text-xs text-muted-foreground hover:underline">
          ← All agents
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">
          {agentQuery.data?.name ?? "Loading…"}
        </h1>
        {agentQuery.data?.instructions ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground line-clamp-3">
            {agentQuery.data.instructions}
          </p>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="rounded-3xl border-border bg-card shadow-sm">
            <CardHeader className="p-6">
              <CardTitle>Start a new chat</CardTitle>
              <CardDescription>
                Give this session an optional title, then start the conversation.
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
                <Button type="submit" disabled={createMeeting.isPending}>
                  {createMeeting.isPending ? "Creating…" : "New chat"}
                </Button>
                {createMeeting.error ? (
                  <p className="text-sm text-destructive">{createMeeting.error.message}</p>
                ) : null}
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border bg-card shadow-sm">
            <CardHeader className="p-6">
              <CardTitle>Previous chats</CardTitle>
              <CardDescription>Pick up an earlier conversation with this agent.</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              {meetingsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : meetings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No chats yet — start one above.</p>
              ) : (
                <ul className="space-y-2">
                  {meetings.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/agents/${agentId}/chat/${m.id}`}
                        className="block rounded-xl border border-border bg-background px-4 py-3 transition hover:border-primary/40 hover:bg-muted"
                      >
                        <div className="text-sm font-semibold text-foreground">{m.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Updated {new Date(m.updatedAt as unknown as string).toLocaleString()}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
