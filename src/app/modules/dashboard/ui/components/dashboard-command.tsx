import { CommandDialog, CommandInput, CommandList, CommandEmpty } from "@/components/ui/command";
import { Dispatch, SetStateAction } from "react";

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export const DashboardCommand = ({ open, setOpen }: Props) => {
    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Search agents, chats, or commands" />
            <CommandList>
                <CommandEmpty>No quick actions available yet.</CommandEmpty>
            </CommandList>
        </CommandDialog>
    );
};
