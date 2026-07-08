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
    // Prefetch failures are fine — the client view re-fetches and the
    // route's error.tsx handles genuine not-found cases.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
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
    </HydrationBoundary>
  );
};

export default Page;