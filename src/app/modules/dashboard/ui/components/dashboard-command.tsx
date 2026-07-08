"use client";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import {
  BotIcon,
  HomeIcon,
  LogOutIcon,
  PlusCircleIcon,
  UserCogIcon,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { authClient } from "@/lib/auth-client";

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export const DashboardCommand = ({ open, setOpen }: Props) => {
  const router = useRouter();

  const run = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const signOut = async () => {
    setOpen(false);
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search agents, chats, or commands" />
      <CommandList>
        <CommandEmpty>No matching actions.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => run("/")}>
            <HomeIcon />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => run("/agents")}>
            <BotIcon />
            <span>Browse agents</span>
          </CommandItem>
          <CommandItem onSelect={() => run("/agents/new")}>
            <PlusCircleIcon />
            <span>New agent</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Account">
          <CommandItem onSelect={() => run("/account")}>
            <UserCogIcon />
            <span>Account settings</span>
          </CommandItem>
          <CommandItem onSelect={signOut}>
            <LogOutIcon />
            <span>Sign out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};