"use client";

import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  description: string;
}

export const ErrorState = ({ title, description }: Props) => {
  return (
    <div className="flex flex-1 items-center justify-center px-8 py-4">
      <div className="flex animate-scale-in flex-col items-center justify-center gap-6 rounded-2xl bg-background p-10 text-center shadow-sm">
        <span className="flex size-14 animate-fade-in items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircleIcon className="size-7" />
        </span>
        <div className="flex flex-col gap-2">
          <h6 className="text-lg font-medium">{title}</h6>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => {
            if (typeof window !== "undefined") window.location.reload();
          }}
        >
          <RefreshCwIcon className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
};