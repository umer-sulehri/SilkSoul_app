import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "border-border bg-surface-soft text-muted",
        success: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        danger: "border-danger/20 bg-danger/10 text-danger",
        primary: "border-primary/20 bg-primary/10 text-primary",
        accent: "border-accent/30 bg-accent/10 text-accent-ink",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);

export function Badge({
  className,
  tone,
  children,
}: VariantProps<typeof badgeVariants> & {
  className?: string;
  children: React.ReactNode;
}) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}

const statusTone: Record<string, VariantProps<typeof badgeVariants>["tone"]> = {
  pending: "warning",
  confirmed: "primary",
  processing: "primary",
  shipped: "accent",
  delivered: "success",
  cancelled: "danger",
  returned: "danger",
  unpaid: "warning",
  paid: "success",
  failed: "danger",
  refunded: "neutral",
  partially_refunded: "warning",
  approved: "success",
  rejected: "danger",
  hidden: "neutral",
  draft: "neutral",
  sent: "primary",
  accepted: "success",
  expired: "warning",
  active: "success",
  inactive: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={statusTone[status] ?? "neutral"}>
      {status.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())}
    </Badge>
  );
}
