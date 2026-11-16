import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-serif text-3xl leading-tight text-ink sm:text-[34px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function DemoNotice() {
  return (
    <div className="rounded-[14px] border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-ink">
      <p className="font-semibold">Backend not connected</p>
      <p className="mt-1 text-muted">
        This studio needs Supabase. Add the environment variables, run the migrations and seed,
        then sign in again.
      </p>
    </div>
  );
}
