"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  BotIcon,
  Loader2Icon,
  SendIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  meetingId: string;
}

export const ChatView = ({ agentId, meetingId }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const didMountRef = useRef(false);

  const messagesQuery = useQuery(
    trpc.messages.getMany.queryOptions({ meetingId }),
  );
  const agentQuery = useQuery(trpc.agents.getOne.queryOptions({ id: agentId }));
  const messages = messagesQuery.data ?? [];
  const agent = agentQuery.data;

  const deleteMeeting = useMutation(
    trpc.meetings.delete.mutationOptions({
      onSuccess: async () => {
        toast.success("Chat deleted");
        await queryClient.invalidateQueries({
          queryKey: trpc.meetings.getMany.queryKey({ agentId }),
        });
        router.push(`/agents/${agentId}`);
      },
      onError: (e) => toast.error(e.message || "Could not delete this chat."),
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
      onError: async (e) => {
        // The user's message is already persisted server-side — refresh
        // so it still shows even though the agent reply failed.
        await queryClient.invalidateQueries({
          queryKey: trpc.messages.getMany.queryKey({ meetingId }),
        });
        toast.error(e.message || "The agent could not reply. Try again.");
      },
    }),
  );

  const pending = sendMessage.isPending;

  // Keep the latest message in view: jump on first mount, smooth-scroll
  // thereafter as messages arrive or the typing indicator appears.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!didMountRef.current) {
      el.scrollTop = el.scrollHeight;
      didMountRef.current = true;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length, pending]);

  const send = () => {
    const text = content.trim();
    if (!text || pending) return;
    startTransition(() => sendMessage.mutate({ meetingId, content: text }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    send();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const confirmDelete = () => {
    setConfirmOpen(false);
    deleteMeeting.mutate({ id: meetingId });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-card/60 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/agents/${agentId}`}
            aria-label="Back to agent"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
          </Link>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/15 to-cyan-400/15 text-primary">
            <BotIcon className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-foreground">
              {agent?.name ?? "Chat"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {pending
                ? "Typing…"
                : agent
                  ? "Send a message to continue"
                  : "Loading…"}
            </p>
          </div>
        </div>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={deleteMeeting.isPending}
            className="gap-1.5"
          >
            <TrashIcon className="size-4" />
            <span className="hidden sm:inline">
              {deleteMeeting.isPending ? "Deleting…" : "Delete chat"}
            </span>
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the conversation. This action cannot
                be undone.
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

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6">
        <ol
          data-testid="message-list"
          className="mx-auto flex max-w-3xl flex-col gap-4"
        >
          {messages.length === 0 && !pending ? (
            <li className="animate-fade-in rounded-3xl border border-dashed border-border bg-background/60 p-6 text-center text-sm text-muted-foreground">
              No messages yet — say hi to start the conversation.
            </li>
          ) : null}

          {messages.map((m, index) => {
            const isUser = m.role === "user";
            return (
              <li
                key={m.id}
                data-role={m.role}
                style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
                className={cn(
                  "flex animate-message-in gap-3",
                  isUser ? "flex-row-reverse" : "flex-row",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                    isUser
                      ? "bg-primary/15 text-primary"
                      : "bg-gradient-to-br from-violet-500/15 to-cyan-400/15 text-primary",
                  )}
                >
                  {isUser ? (
                    <UserIcon className="size-4" />
                  ) : (
                    <BotIcon className="size-4" />
                  )}
                </span>
                <div
                  className={cn(
                    "max-w-[80%] rounded-3xl px-4 py-3 text-sm shadow-sm",
                    isUser
                      ? "rounded-tr-md bg-primary text-primary-foreground"
                      : "rounded-tl-md border border-border bg-card text-card-foreground",
                  )}
                >
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">
                    {isUser ? "You" : agent?.name ?? "Agent"}
                  </div>
                  <div className="whitespace-pre-wrap break-words">
                    {m.content}
                  </div>
                </div>
              </li>
            );
          })}

          {pending ? (
            <li className="flex animate-fade-in gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/15 to-cyan-400/15 text-primary">
                <BotIcon className="size-4" />
              </span>
              <div className="flex items-center gap-1.5 rounded-3xl rounded-tl-md border border-border bg-card px-4 py-3.5 shadow-sm">
                <span className="typing-dot size-2 rounded-full bg-muted-foreground" />
                <span
                  className="typing-dot size-2 rounded-full bg-muted-foreground"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="typing-dot size-2 rounded-full bg-muted-foreground"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </li>
          ) : null}
        </ol>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card/60 px-4 py-4 backdrop-blur-xl sm:px-6">
        <form onSubmit={handleSubmit} className="mx-auto grid max-w-3xl gap-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…  (Enter to send, Shift+Enter for a new line)"
            disabled={pending}
            rows={3}
            autoFocus
            className="resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
              {pending ? "The agent is replying…" : "Press Enter to send."}
            </div>
            <Button
              type="submit"
              disabled={pending || content.trim().length === 0}
              className="gap-1.5"
            >
              {pending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <SendIcon className="size-4" />
              )}
              {pending ? "Sending…" : "Send"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};