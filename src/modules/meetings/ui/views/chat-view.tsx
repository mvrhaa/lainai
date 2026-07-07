"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Props {
    agentId: string;
    meetingId: string;
}

/**
 * Logic-only chat view: an ordered list of messages + a form that posts a
 * user turn via tRPC. The agent's reply comes back in the same mutation
 * response and is appended. Phase 2 will replace this with the sphere UI.
 *
 * We read initial messages from the React Query cache (server-prefetched
 * via the page) rather than passing them as a prop, so the type comes
 * straight from the tRPC inferred query result and stays in sync.
 */
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
        <div className="flex h-full flex-col">
            <ol
                data-testid="message-list"
                className="flex-1 space-y-3 overflow-y-auto p-4"
            >
                {messages.length === 0 ? (
                    <li className="text-sm text-muted-foreground">
                        No messages yet — say hi to start the conversation.
                    </li>
                ) : (
                    messages.map((m) => (
                        <li
                            key={m.id}
                            data-role={m.role}
                            className={
                                m.role === "user"
                                    ? "rounded-md bg-primary/10 p-3 text-sm"
                                    : "rounded-md bg-muted p-3 text-sm"
                            }
                        >
                            <div className="mb-1 text-xs font-medium text-muted-foreground">
                                {m.role === "user" ? "You" : "Agent"}
                            </div>
                            <div className="whitespace-pre-wrap wrap-break-word">
                                {m.content}
                            </div>
                        </li>
                    ))
                )}
            </ol>

            <div className="flex items-center justify-end gap-2 border-t bg-background px-4 py-3">
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteMeeting.isPending}
                    className="rounded-md border border-destructive bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                >
                    {deleteMeeting.isPending ? "Deleting…" : "Delete chat"}
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex gap-2 border-t bg-background p-4"
            >
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={sendMessage.isPending}
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={sendMessage.isPending || content.trim().length === 0}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                    {sendMessage.isPending ? "Sending…" : "Send"}
                </button>
            </form>

            {sendMessage.error ? (
                <p className="border-t bg-destructive/10 px-4 py-2 text-xs text-destructive">
                    {sendMessage.error.message}
                </p>
            ) : null}
        </div>
    );
};
