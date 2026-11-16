"use client";

import { useActionState } from "react";
import { Check, CircleDashed, PackageSearch } from "lucide-react";
import { trackOrderAction, type TrackOrderState } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError, HelperText, Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

const initialState: TrackOrderState = { status: "idle" };

const journey: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

export function TrackOrderForm() {
  const [state, formAction, pending] = useActionState(trackOrderAction, initialState);
  const order = state.order;
  const currentIndex = order ? journey.indexOf(order.status) : -1;
  const cancelled = order?.status === "cancelled" || order?.status === "returned";

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
      <div>
        <form action={formAction} className="rounded-[18px] border border-border bg-surface p-6">
          <div className="flex items-center gap-2">
            <PackageSearch className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="font-serif text-2xl text-ink">Find your order</h2>
          </div>
          <p className="mt-2 text-sm text-muted">
            Enter the order reference from your confirmation and the phone number used at
            checkout.
          </p>
          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="orderNumber">Order reference</Label>
              <Input
                id="orderNumber"
                name="orderNumber"
                placeholder="SS-260101-A1B2C3"
                autoComplete="off"
                required
                className="uppercase"
              />
              <FieldError message={state.fieldErrors?.orderNumber} />
            </div>
            <div>
              <Label htmlFor="track-phone">Phone number</Label>
              <Input
                id="track-phone"
                name="phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="03xx xxxxxxx"
                required
              />
              <FieldError message={state.fieldErrors?.phone} />
              <HelperText>We match the last 10 digits of the phone number.</HelperText>
            </div>
          </div>

          {state.status === "error" && state.message ? (
            <p className="mt-4 rounded-[10px] border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
              {state.message}
            </p>
          ) : null}

          <Button type="submit" className="mt-5 w-full" loading={pending}>
            Track order
          </Button>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Order lookup is rate limited. References are not sequential and cannot be guessed.
          </p>
        </form>
      </div>

      <div>
        {order ? (
          <div className="rounded-[18px] border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Order</p>
                <p className="mt-1 font-serif text-2xl tabular-nums text-ink">{order.orderNumber}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <ol className="mt-6 space-y-4 border-l border-border pl-5">
              {journey.map((status, index) => {
                const active = !cancelled && index <= currentIndex;
                const current = !cancelled && index === currentIndex;
                const timelineEntry = order.timeline.find((entry) => entry.status === status);
                return (
                  <li key={status} className="relative">
                    <span
                      className={
                        active
                          ? "absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white"
                          : "absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-surface text-muted"
                      }
                    >
                      {active ? (
                        <Check className="h-2.5 w-2.5" aria-hidden="true" />
                      ) : (
                        <CircleDashed className="h-2.5 w-2.5" aria-hidden="true" />
                      )}
                    </span>
                    <p className={current ? "text-sm font-semibold text-ink" : "text-sm text-muted"}>
                      {status.replace(/^\w/, (char) => char.toUpperCase())}
                    </p>
                    <p className="text-[11px] text-muted">
                      {timelineEntry?.at ? formatDate(timelineEntry.at) : active ? "Completed" : "Pending"}
                    </p>
                  </li>
                );
              })}
            </ol>
            {cancelled ? (
              <p className="mt-4 rounded-[10px] bg-danger/5 px-3 py-2 text-xs text-danger">
                This order was {order.status}. If this is unexpected, please contact us.
              </p>
            ) : null}

            <dl className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              <div className="flex justify-between text-muted">
                <dt>Placed</dt>
                <dd className="text-ink">{formatDate(order.placedAt)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Deliver to</dt>
                <dd className="text-ink">{order.city}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Payment</dt>
                <dd className="capitalize text-ink">
                  {order.paymentMethod.replaceAll("_", " ")} · {order.paymentStatus}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-ink">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatCurrency(order.grandTotal, order.currency)}</dd>
              </div>
            </dl>

            <ul className="mt-5 space-y-2 border-t border-border pt-4">
              {order.items.map((item) => (
                <li key={`${item.productName}-${item.productSku}`} className="flex justify-between gap-3 text-sm">
                  <span className="text-muted">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="tabular-nums text-ink">{formatCurrency(item.lineTotal, order.currency)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-[18px] border border-dashed border-border bg-surface-soft/40 p-8 text-center">
            <PackageSearch className="h-6 w-6 text-muted" aria-hidden="true" />
            <h3 className="mt-4 font-serif text-2xl text-ink">Order updates, without the guesswork</h3>
            <p className="mt-2 max-w-sm text-sm text-muted">
              Your order status will appear here once we match the reference and phone number.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
