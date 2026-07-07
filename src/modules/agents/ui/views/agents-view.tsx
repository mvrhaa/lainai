"use client";

import Link from "next/link";
import { BotIcon, ArrowRightIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const AgentsView = () => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

    if (data.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center p-8">
                <div className="max-w-md rounded-lg border bg-background p-8 text-center shadow-sm">
                    <BotIcon className="mx-auto mb-3 size-8 text-muted-foreground" />
                    <h2 className="text-base font-medium">No agents yet</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Once you create an agent it&rsquo;ll show up here. Click any
                        agent to start a chat.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {data.map((agent) => (
                    <li key={agent.id}>
                        <Link
                            href={`/agents/${agent.id}`}
                            className="group flex h-full flex-col justify-between rounded-lg border bg-background p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <BotIcon className="size-4 text-primary" />
                                    <h3 className="text-sm font-medium">
                                        {agent.name}
                                    </h3>
                                </div>
                                <p className="line-clamp-3 text-xs text-muted-foreground">
                                    {agent.instructions}
                                </p>
                            </div>
                            <div className="mt-3 flex items-center justify-end text-xs text-muted-foreground group-hover:text-primary">
                                Open chat
                                <ArrowRightIcon className="ml-1 size-3" />
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};
