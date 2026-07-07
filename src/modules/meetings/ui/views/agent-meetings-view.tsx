"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Props {
    agentId: string;
}

export const AgentMeetingsView = ({ agentId }: Props) => {
    const trpc = useTRPC();
    const queryClient = useQueryClient();
    const router = useRouter();
    const [name, setName] = useState("");

    // The agent header.
    const agentQuery = useQuery(trpc.agents.getOne.queryOptions({ id: agentId }));

    // List of meetings with this agent.
    const meetingsQuery = useQuery(
        trpc.meetings.getMany.queryOptions({ agentId }),
    );

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
        <div className="flex h-full flex-col">
            <header className="border-b bg-background px-6 py-4">
                <Link
                    href="/agents"
                    className="text-xs text-muted-foreground hover:underline"
                >
                    ← All agents
                </Link>
                <h1 className="mt-1 text-2xl font-semibold">
                    {agentQuery.data?.name ?? "Loading…"}
                </h1>
                {agentQuery.data?.instructions ? (
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground line-clamp-3">
                        {agentQuery.data.instructions}
                    </p>
                ) : null}
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
                <section>
                    <h2 className="mb-2 text-sm font-medium text-muted-foreground">
                        Start a new chat
                    </h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            createMeeting.mutate({
                                agentId,
                                name: name.trim() || undefined,
                            });
                        }}
                        className="flex gap-2"
                    >
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Optional title (e.g. 'Brainstorming')"
                            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            disabled={createMeeting.isPending}
                        />
                        <button
                            type="submit"
                            disabled={createMeeting.isPending}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                        >
                            {createMeeting.isPending ? "Creating…" : "New chat"}
                        </button>
                    </form>
                    {createMeeting.error ? (
                        <p className="mt-2 text-xs text-destructive">
                            {createMeeting.error.message}
                        </p>
                    ) : null}
                </section>

                <section>
                    <h2 className="mb-2 text-sm font-medium text-muted-foreground">
                        Previous chats
                    </h2>
                    {meetingsQuery.isLoading ? (
                        <p className="text-sm text-muted-foreground">Loading…</p>
                    ) : meetings.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No chats yet &mdash; start one above.
                        </p>
                    ) : (
                        <ul className="divide-y rounded-md border bg-background">
                            {meetings.map((m) => (
                                <li key={m.id}>
                                    <Link
                                        href={`/agents/${agentId}/chat/${m.id}`}
                                        className="block px-4 py-3 hover:bg-muted"
                                    >
                                        <div className="text-sm font-medium">
                                            {m.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Updated{" "}
                                            {new Date(
                                                m.updatedAt as unknown as string,
                                            ).toLocaleString()}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
};
