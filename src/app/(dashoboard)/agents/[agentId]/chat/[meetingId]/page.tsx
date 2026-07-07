import Link from "next/link";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { LoadingState } from "@/components/loading-state";
import { getQueryClient, trpc } from "@/trpc/server";
import { ChatView } from "@/modules/meetings/ui/views/chat-view";

interface PageProps {
    params: Promise<{ agentId: string; meetingId: string }>;
}

const Page = async ({ params }: PageProps) => {
    const { agentId, meetingId } = await params;
    const queryClient = getQueryClient();
    try {
        await Promise.all([
            queryClient.prefetchQuery(
                trpc.agents.getOne.queryOptions({ id: agentId }),
            ),
            queryClient.prefetchQuery(
                trpc.meetings.getOne.queryOptions({ id: meetingId }),
            ),
            queryClient.prefetchQuery(
                trpc.messages.getMany.queryOptions({ meetingId }),
            ),
        ]);
    } catch {
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="flex h-full flex-col">
                <header className="flex items-center justify-between border-b bg-background px-6 py-3">
                    <div>
                        <Link
                            href={`/agents/${agentId}`}
                            className="text-xs text-muted-foreground hover:underline"
                        >
                            ← Back to agent
                        </Link>
                        <h1 className="mt-1 text-base font-semibold">
                            {/* Title is read client-side from the meeting query;
                                we don't await it here so the page renders
                                even when the meeting is missing. */}
                            Chat
                        </h1>
                    </div>
                </header>
                <Suspense
                    fallback={
                        <LoadingState
                            title="Loading chat"
                            description="Fetching the conversation…"
                        />
                    }
                >
                    <ChatView agentId={agentId} meetingId={meetingId} />
                </Suspense>
            </div>
        </HydrationBoundary>
    );
};

export default Page;
