"use client";

import { cn } from "@/lib/utils";

export function ConfirmButton({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={cn(
        "text-xs text-muted underline-offset-2 hover:text-danger hover:underline",
        className,
      )}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
