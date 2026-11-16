import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details
      className={cn("group border-b border-border py-5", className)}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-4">
        {title}
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="pt-4 text-sm leading-relaxed text-muted">{children}</div>
    </details>
  );
}
