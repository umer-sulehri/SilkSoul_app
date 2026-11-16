import { Star } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { ProductRating } from "@/types/catalog";

export function Price({
  amount,
  compareAt,
  currency = "PKR",
  className,
  size = "md",
}: {
  amount: number;
  compareAt?: number | null;
  currency?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";
  return (
    <div className={cn("flex items-baseline gap-2 tabular-nums", className)}>
      <span className={cn("font-semibold text-ink", sizeClass)}>
        {formatCurrency(amount, currency)}
      </span>
      {compareAt && compareAt > amount ? (
        <span className="text-sm text-muted line-through">
          {formatCurrency(compareAt, currency)}
        </span>
      ) : null}
    </div>
  );
}

export function StarRating({
  rating,
  count,
  className,
  showCount = true,
}: {
  rating: ProductRating;
  count?: number;
  className?: string;
  showCount?: boolean;
}) {
  const value = rating.average;
  const rounded = Math.round(value * 2) / 2;
  const total = count ?? rating.count;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${value.toFixed(1)} out of 5 stars`}
      >
        {Array.from({ length: 5 }).map((_, index) => {
          const position = index + 1;
          const filled = rounded >= position;
          const half = !filled && rounded >= position - 0.5;
          return (
            <span key={position} className="relative block h-4 w-4">
              <Star className="absolute inset-0 h-4 w-4 text-border" aria-hidden="true" />
              {filled || half ? (
                <span className="absolute inset-0 overflow-hidden" style={{ width: half ? "50%" : "100%" }}>
                  <Star
                    className="h-4 w-4 fill-accent text-accent"
                    aria-hidden="true"
                  />
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
      {showCount ? (
        <span className="text-xs text-muted">
          {total > 0 ? `${value.toFixed(1)} (${total})` : "No reviews yet"}
        </span>
      ) : null}
    </div>
  );
}

export function StockStatus({
  available,
  threshold = 5,
  className,
}: {
  available: number;
  threshold?: number;
  className?: string;
}) {
  if (available <= 0) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium text-danger", className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-danger" aria-hidden="true" />
        Out of stock
      </span>
    );
  }

  if (available <= threshold) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium text-warning", className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
        Only {available} left
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium text-success", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
      In stock
    </span>
  );
}
