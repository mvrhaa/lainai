"use client";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { BotIcon, HomeIcon, PlusCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { DashboardUserButton } from "./dashboard-user-button";

const menuItems = [
    {
        icon: HomeIcon,
        label: "Home",
        href: "/",
    },
    {
        icon: BotIcon,
        label: "Agents",
        href: "/agents",
    },
    {
        icon: PlusCircle,
        label: "New agent",
        href: "/agents/new",
    },
];

export const DashboardSideBar = () => {
    const pathname = usePathname();
    return (
        <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
            {/* ambient indigo glow — echoes the main canvas so the rail feels connected */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_62%)]" />

            <SidebarHeader className="relative px-3 pt-5">
                <Link
                    href="/"
                    className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.03]"
                >
                    <span className="inline-flex size-10 shrink-0 items-center justify-center  bg-white/[0.04] ">
                        <Image
                            src="/logol.svg"
                            height={90}
                            width={90}
                            alt="LainAI logo"
                            className="bg-transparent"
                        />
                    </span>
                    <div className="hidden min-w-0 flex-col leading-tight md:flex">
                        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                            Your own
                        </span>
                        <span className="truncate text-[11px] text-sidebar-foreground/50">
                            Intelligent workspace
                        </span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="relative px-2 pt-3">
                <SidebarGroup>
                    <SidebarGroupLabel className="px-3 text-[10px] font-medium uppercase tracking-[0.2em] text-sidebar-foreground/40">
                        Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-0.5">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.label}
                                            className={cn(
                                                "relative h-9 rounded-lg px-2.5 text-[13px] font-medium text-sidebar-foreground/70",
                                                "transition-colors duration-150",
                                                "hover:bg-white/[0.04] hover:text-sidebar-foreground",
                                                "data-[active=true]:bg-white/[0.06] data-[active=true]:text-sidebar-foreground",
                                            )}
                                        >
                                            <Link href={item.href} className="flex w-full items-center gap-3">
                                                <item.icon
                                                    className={cn(
                                                        "size-4 shrink-0 opacity-70 transition-colors",
                                                        isActive && "text-indigo-300 opacity-100",
                                                    )}
                                                />
                                                <span className="truncate">{item.label}</span>
                                                {isActive && (
                                                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-indigo-400" />
                                                )}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="relative px-2 pb-4 pt-2">
                <div className="mx-2 mb-2 h-px bg-sidebar-border" />
                <DashboardUserButton />
            </SidebarFooter>
        </Sidebar>
    );
};