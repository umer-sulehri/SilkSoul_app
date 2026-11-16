import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-2 block text-sm font-medium text-ink", className)}
      {...props}
    />
  );
}

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-danger" role="alert">
      {message}
    </p>
  );
}

export function HelperText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-muted">{children}</p>;
}
