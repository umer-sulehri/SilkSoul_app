import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  size = "default",
}: {
  className?: string;
  children: React.ReactNode;
  size?: "default" | "narrow" | "wide";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        size === "narrow" ? "max-w-3xl" : size === "wide" ? "max-w-[1400px]" : "max-w-[1280px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary",
            align === "center" && "justify-center",
          )}
        >
          <span className="h-px w-5 bg-accent" aria-hidden="true" />
          {eyebrow}
          {align === "center" ? (
            <span className="h-px w-5 bg-accent" aria-hidden="true" />
          ) : null}
        </p>
      ) : null}
      <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted">{description}</p>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-border bg-surface-soft/40 px-6 py-16 text-center">
      {icon ? <div className="mb-4 text-muted">{icon}</div> : null}
      <h3 className="font-serif text-2xl text-ink">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[10px] bg-surface-soft", className)} />;
}

export function Alert({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "success" | "warning" | "danger";
  title?: string;
  children?: React.ReactNode;
}) {
  const tones = {
    info: "border-primary/20 bg-primary/5 text-ink",
    success: "border-success/20 bg-success/5 text-ink",
    warning: "border-warning/30 bg-warning/10 text-ink",
    danger: "border-danger/25 bg-danger/5 text-ink",
  } as const;

  return (
    <div className={cn("rounded-[14px] border px-4 py-3 text-sm", tones[tone])} role="status">
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={cn(title && "mt-1 text-muted")}>{children}</div> : null}
    </div>
  );
}
