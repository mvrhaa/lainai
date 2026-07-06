"use client";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { BotIcon, MessageCircle, StarIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { DashboardUserButton } from "./dashboard-user-button";

const menuItems = [
    {
        icon: BotIcon,
        label: "Agents",
        href: "/agents",
    },
    {
        icon: MessageCircle,
        label: "Chat",
        href: "/chat",
    },
    {
        icon: StarIcon,
        label: "Upgrade",
        href: "/upgrade",
        className: "mb-2",
    },
];

export const DashboardSideBar = () => {
    const pathname = usePathname();
    return (
        <Sidebar>
            <SidebarHeader className="text-sidebar-accent-foreground">
                <Link href="/" className="flex items-center gap-2 px-2 pt-2">
                    <Image src="/logol.svg" height={75} width={75} alt="LainAI logo" />
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-2 pt-2">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.href} className={item.className ?? ""}>
                                    <SidebarMenuButton asChild className={cn(
                                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                        pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
                                    )}>
                                        <Link
                                            href={item.href}
                                            className="flex w-full items-center gap-2"
                                        >
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

            <SidebarFooter className="px-2 pb-2 pt-4">
                <DashboardUserButton />
            </SidebarFooter>
        </Sidebar>
    );
}
