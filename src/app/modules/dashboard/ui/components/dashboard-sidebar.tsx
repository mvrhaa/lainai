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
import { Separator } from "@/components/ui/separator";
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
        <Sidebar className="border-r border-white/10 bg-slate-950/95 shadow-[10px_0_60px_-30px_rgba(15,23,42,0.45)]">
            <SidebarHeader className="text-sidebar-accent-foreground">
                <Link href="/" className="flex items-center gap-3 px-4 pt-4">
                    <span className="inline-flex h-20 w-20 items-center justify-center rounded-3xl">
                        <Image src="/logol.svg" height={90} width={90} alt="LainAI logo" className="bg-transparent" />
                    </span>
                    <div className="hidden flex-col md:flex">
                        <span className="text-sm font-semibold text-sidebar-foreground">LainAI</span>
                        <span className="text-xs text-sidebar-foreground/70">Workspace control</span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-2 pt-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="px-3 text-xs uppercase tracking-[0.35em] text-sidebar-foreground/60">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        className={cn(
                                            "rounded-3xl",
                                            pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground",
                                        )}
                                    >
                                        <Link href={item.href} className="flex w-full items-center gap-3">
                                            <item.icon className="size-4" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <Separator className="mx-2 my-2 border-sidebar-border" />

            <SidebarFooter className="px-2 pb-4 pt-3">
                <DashboardUserButton />
            </SidebarFooter>
        </Sidebar>
    );
};