import { LoadingState } from "@/components/loading-state";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { AgentMeetingsView } from "@/modules/meetings/ui/views/agent-meetings-view";

interface PageProps {
    params: Promise<{ agentId: string }>;
}

const Page = async ({ params }: PageProps) => {
    const { agentId } = await params;
    const queryClient = getQueryClient();

    try {
        await queryClient.prefetchQuery(
            trpc.agents.getOne.queryOptions({ id: agentId }),
        );
    } catch {
    }

    void queryClient.prefetchQuery(
        trpc.meetings.getMany.queryOptions({ agentId }),
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense
                fallback={
                    <LoadingState
                        title="Loading agent"
                        description="Fetching the agent and its meetings…"
                    />
                }
            >
                {/* The ErrorBoundary lives one level up — but in the App
                    Router the error.tsx file covers this route segment. */}
                <AgentMeetingsView agentId={agentId} />
            </Suspense>
        </HydrationBoundary>
    );
};

export default Page;
