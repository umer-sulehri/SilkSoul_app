import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import {
  deleteReviewAction,
  moderateReviewAction,
} from "@/app/admin/actions/reviews";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/layout";
import { StarRating } from "@/components/ui/price";
import { getAdminContext } from "@/lib/auth/admin";
import { listAdminReviews } from "@/lib/data/admin";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Reviews" };

const tabs = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "hidden", label: "Hidden" },
];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const [reviews, context] = await Promise.all([
    listAdminReviews(params.status),
    getAdminContext(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Community"
        title="Reviews"
        description="Only approved reviews appear on the storefront. Verified badges come from delivered orders."
      />

      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {tabs.map((tab) => {
          const active = (params.status ?? "") === tab.value;
          return (
            <Link
              key={tab.value || "all"}
              href={tab.value ? `/admin/reviews?status=${tab.value}` : "/admin/reviews"}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary/25 bg-primary/10 text-primary"
                  : "border-border bg-surface text-muted hover:text-ink",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews here"
          description="Customer reviews submitted from product pages will wait here for moderation."
          icon={<Star className="h-7 w-7" aria-hidden="true" />}
        />
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-[16px] border border-border bg-surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink">{review.display_name}</p>
                    <StatusBadge status={review.status} />
                    {review.is_verified_purchase ? (
                      <span className="rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                        Verified purchase
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {review.product ? (
                      <Link
                        href={`/products/${review.product.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-ink hover:underline"
                      >
                        {review.product.name}
                      </Link>
                    ) : (
                      "Product removed"
                    )}{" "}
                    · {formatDateTime(review.created_at)}
                  </p>
                </div>
                <StarRating
                  rating={{ average: review.rating, count: 1 }}
                  showCount={false}
                />
              </div>

              {review.title ? (
                <p className="mt-3 font-medium text-ink">{review.title}</p>
              ) : null}
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                {review.body}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                {review.status !== "approved" ? (
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button
                      type="submit"
                      className="rounded-[8px] bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover"
                    >
                      Approve
                    </button>
                  </form>
                ) : null}
                {review.status !== "rejected" ? (
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="status" value="rejected" />
                    <button
                      type="submit"
                      className="rounded-[8px] border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-soft"
                    >
                      Reject
                    </button>
                  </form>
                ) : null}
                {review.status !== "hidden" ? (
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="status" value="hidden" />
                    <button
                      type="submit"
                      className="rounded-[8px] border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-soft"
                    >
                      Hide
                    </button>
                  </form>
                ) : null}
                {review.status !== "pending" ? (
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="reviewId" value={review.id} />
                    <input type="hidden" name="status" value="pending" />
                    <button
                      type="submit"
                      className="rounded-[8px] px-2 py-1.5 text-xs text-muted hover:text-ink"
                    >
                      Move to pending
                    </button>
                  </form>
                ) : null}
                {context.isAdmin ? (
                  <form action={deleteReviewAction} className="ml-auto">
                    <input type="hidden" name="reviewId" value={review.id} />
                    <ConfirmButton message="Permanently delete this review?">
                      Delete
                    </ConfirmButton>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
