"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  meetingId: string;
}

export const ChatView = ({ agentId, meetingId }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [, startTransition] = useTransition();

  const { data: messages = [] } = useQuery(
    trpc.messages.getMany.queryOptions({ meetingId }),
  );

  const deleteMeeting = useMutation(
    trpc.meetings.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.messages.getMany.queryKey({ meetingId }),
        });
        router.push(`/agents/${agentId}`);
      },
    }),
  );

  const sendMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: async () => {
        setContent("");
        await queryClient.invalidateQueries({
          queryKey: trpc.messages.getMany.queryKey({ meetingId }),
        });
      },
    }),
  );

  const handleDelete = async () => {
    if (!window.confirm("Delete this chat? This cannot be undone.")) {
      return;
    }
    deleteMeeting.mutate({ id: meetingId });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = content.trim();
    if (!text || sendMessage.isPending) return;
    startTransition(() => {
      sendMessage.mutate({ meetingId, content: text });
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Card className="flex h-full flex-col rounded-3xl border-border bg-card shadow-sm">
        <CardHeader className="space-y-2 border-b border-border p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Chat</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Send a message to the agent and continue the conversation.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMeeting.isPending}
            >
              {deleteMeeting.isPending ? "Deleting…" : "Delete chat"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4 p-0">
          <div className="flex-1 overflow-y-auto p-6">
            <ol data-testid="message-list" className="space-y-3">
              {messages.length === 0 ? (
                <li className="rounded-3xl border border-border bg-background p-6 text-sm text-muted-foreground">
                  No messages yet — say hi to start the conversation.
                </li>
              ) : (
                messages.map((m) => (
                  <li
                    key={m.id}
                    data-role={m.role}
                    className={
                      m.role === "user"
                        ? "rounded-3xl bg-primary/10 p-4 text-sm"
                        : "rounded-3xl bg-muted p-4 text-sm"
                    }
                  >
                    <div className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      {m.role === "user" ? "You" : "Agent"}
                    </div>
                    <div className="whitespace-pre-wrap wrap-break-words">{m.content}</div>
                  </li>
                ))
              )}
            </ol>
          </div>

          <Separator />

          <form onSubmit={handleSubmit} className="grid gap-3 p-6">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message…"
              disabled={sendMessage.isPending}
              rows={4}
              autoFocus
            />
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                Press enter to send. Keep replies short and focused.
              </div>
              <Button type="submit" disabled={sendMessage.isPending || content.trim().length === 0}>
                {sendMessage.isPending ? "Sending…" : "Send"}
              </Button>
            </div>
            {sendMessage.error ? (
              <p className="rounded-2xl bg-destructive/10 px-4 py-2 text-xs text-destructive">
                {sendMessage.error.message}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
