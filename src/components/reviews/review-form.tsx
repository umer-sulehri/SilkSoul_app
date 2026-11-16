"use client";

import { useActionState, useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { submitReviewAction, type ReviewActionState } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { FieldError, Label } from "@/components/ui/label";
import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const initialState: ReviewActionState = { status: "idle" };

export function ReviewForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState(submitReviewAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Thank you for your review", {
        description: "Your review is awaiting moderation before it appears publicly.",
      });
      formRef.current?.reset();
    }
    if (state.status === "error" && state.message) {
      toast.error("Could not submit review", { description: state.message });
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="rounded-[18px] border border-border bg-surface p-6">
      <input type="hidden" name="productId" value={productId} />
      <h3 className="font-serif text-2xl text-ink">Share your experience</h3>
      <p className="mt-1.5 text-sm text-muted">
        Reviews are read by our team and appear once approved.
      </p>

      {state.status === "success" ? (
        <p className="mt-4 rounded-[10px] border border-success/20 bg-success/5 px-3 py-2 text-sm text-success">
          Thanks — your review is pending moderation.
        </p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="review-name">Display name</Label>
          <Input
            id="review-name"
            name="displayName"
            autoComplete="name"
            placeholder="e.g. Ayesha"
            required
            aria-describedby={state.fieldErrors?.displayName ? "review-name-error" : undefined}
          />
          <FieldError id="review-name-error" message={state.fieldErrors?.displayName} />
        </div>
        <div>
          <Label htmlFor="review-title">Title (optional)</Label>
          <Input id="review-title" name="title" placeholder="Soft and lightweight" />
          <FieldError message={state.fieldErrors?.title} />
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-medium text-ink">Your rating</legend>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" name="rating" value={value} className="peer sr-only" required />
              <Star
                className={cn(
                  "h-7 w-7 text-border transition-colors peer-checked:fill-accent peer-checked:text-accent hover:text-accent",
                )}
                aria-hidden="true"
              />
              <span className="sr-only">{value} star{value === 1 ? "" : "s"}</span>
            </label>
          ))}
        </div>
        <FieldError message={state.fieldErrors?.rating} />
      </fieldset>

      <div className="mt-4">
        <Label htmlFor="review-body">Your review</Label>
        <Textarea
          id="review-body"
          name="body"
          placeholder="What did you notice about the texture, scent or results?"
          required
          aria-describedby={state.fieldErrors?.body ? "review-body-error" : undefined}
        />
        <FieldError id="review-body-error" message={state.fieldErrors?.body} />
      </div>

      {state.status === "error" && state.message && !state.fieldErrors ? (
        <p className="mt-4 text-sm text-danger" role="alert">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" className="mt-5" loading={pending}>
        Submit review
      </Button>
    </form>
  );
}
