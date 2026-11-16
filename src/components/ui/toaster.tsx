"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-[14px] !border !border-border !bg-surface !text-ink !shadow-lg",
          description: "!text-muted",
          actionButton: "!bg-primary !text-white",
          cancelButton: "!bg-surface-soft !text-ink",
        },
      }}
    />
  );
}
