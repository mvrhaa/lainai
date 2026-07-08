"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PanelLeftIcon, PanelLeftCloseIcon, SearchIcon, ArrowRightIcon } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { DashboardCommand } from "./dashboard-command";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const DashboardNavbar = () => {
    const { state, toggleSidebar, isMobile } = useSidebar();
    const trpc = useTRPC();
    const [commandOpen, setCommandOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const trimmedSearch = useMemo(() => search.trim(), [search]);

    const agentsQuery = useQuery({
        ...trpc.agents.search.queryOptions({ query: trimmedSearch || undefined }),
        enabled: trimmedSearch.length > 0,
        staleTime: 10000,
    });

    const chatsQuery = useQuery({
        ...trpc.meetings.search.queryOptions({ query: trimmedSearch || undefined }),
        enabled: trimmedSearch.length > 0,
        staleTime: 10000,
    });

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if ((key === "k" || e.code === "KeyK") && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCommandOpen((open) => !open);
                setSearchOpen(true);
                inputRef.current?.focus();
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <>
            <DashboardCommand open={commandOpen} setOpen={setCommandOpen} />
            <nav className="relative flex flex-wrap items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground backdrop-blur-xl shadow-sm shadow-black/20">
                <div className="flex items-center gap-3">
                    <Button className="size-9" variant="outline" onClick={toggleSidebar}>
                        {(state === "collapsed" || isMobile) ? <PanelLeftIcon className="size-4" /> : <PanelLeftCloseIcon className="size-4" />}
                    </Button>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold tracking-[0.15em] text-sidebar-foreground">LainAI</span>
                        <span className="text-xs text-sidebar-foreground/60">Your intelligent workspace</span>
                    </div>
                </div>

                <div className="relative flex-1 min-w-60 max-w-3xl">
                    <div className="flex items-center gap-2 rounded-2xl border border-sidebar-border bg-white/[0.04] px-3 py-2 shadow-sm shadow-black/20 focus-within:ring-2 focus-within:ring-indigo-500/40">
                        <SearchIcon className="size-4 text-sidebar-foreground/60" />
                        <input
                            ref={inputRef}
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onFocus={() => setSearchOpen(true)}
                            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                            placeholder="Search agents or chats"
                            className="w-full bg-transparent text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40 outline-none"
                        />
                    </div>

                    {searchOpen && trimmedSearch.length > 0 ? (
                        <div className="absolute left-0 right-0 z-20 mt-2 max-h-96 animate-fade-in-up overflow-hidden overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/95 px-2 py-3 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                            <div className="mb-3 flex items-center justify-between px-2 text-xs uppercase tracking-[0.35em] text-white/50">
                                <span>Search results</span>
                                <span>{(agentsQuery.data?.length ?? 0) + (chatsQuery.data?.length ?? 0)} matches</span>
                            </div>

                            {agentsQuery.isLoading || chatsQuery.isLoading ? (
                                <p className="px-2 text-sm text-white/60">Searching…</p>
                            ) : agentsQuery.data?.length || chatsQuery.data?.length ? (
                                <div className="space-y-4">
                                    {agentsQuery.data?.length ? (
                                        <div className="space-y-1 px-2">
                                            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Agents</p>
                                            <div className="space-y-1">
                                                {agentsQuery.data.map((agent) => (
                                                    <Link
                                                        key={agent.id}
                                                        href={`/agents/${agent.id}`}
                                                        className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm text-white transition hover:bg-white/5"
                                                    >
                                                        <span>{agent.name}</span>
                                                        <ArrowRightIcon className="size-4 text-white/50" />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    {chatsQuery.data?.length ? (
                                        <div className="space-y-1 px-2">
                                            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Chats</p>
                                            <div className="space-y-1">
                                                {chatsQuery.data.map((chat) => (
                                                    <Link
                                                        key={chat.id}
                                                        href={`/agents/${chat.agentId}/chat/${chat.id}`}
                                                        className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm text-white transition hover:bg-white/5"
                                                    >
                                                        <span className="truncate">{chat.name}</span>
                                                        <ArrowRightIcon className="size-4 text-white/50" />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <p className="px-2 text-sm text-white/60">No matching agents or chats found.</p>
                            )}
                        </div>
                    ) : null}
                </div>

                
            </nav>
        </>
    );
};