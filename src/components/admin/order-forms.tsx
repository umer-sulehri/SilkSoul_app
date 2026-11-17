"use client";

import { useActionState, useState } from "react";
import {
  confirmOrderPaymentAction,
  saveOrderNoteAction,
  updateOrderStatusAction,
  updatePaymentStatusAction,
  type OrderActionState,
} from "@/app/admin/actions/orders";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orderStatusTransitions } from "@/lib/order-status";
import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types/database";

const initialState: OrderActionState = { status: "idle" };

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function Feedback({ state }: { state: OrderActionState }) {
  if (!state.message) return null;
  return (
    <p
      className={
        state.status === "error"
          ? "rounded-[8px] border border-danger/25 bg-danger/5 px-3 py-2 text-xs text-ink"
          : "rounded-[8px] border border-success/25 bg-success/5 px-3 py-2 text-xs text-ink"
      }
      role="status"
    >
      {state.message}
    </p>
  );
}

export function OrderStatusQuickForm({
  orderId,
  orderNumber,
  status,
}: {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
}) {
  const [state, formAction, isPending] = useActionState(
    updateOrderStatusAction,
    initialState,
  );
  const [nextStatus, setNextStatus] = useState("");
  const nextStatuses = orderStatusTransitions[status];

  if (nextStatuses.length === 0) {
    return <p className="text-[11px] text-muted">Final status</p>;
  }

  return (
    <form action={formAction} className="space-y-1.5">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="flex items-center gap-1.5">
        <Select
          name="status"
          value={nextStatus}
          onChange={(event) => setNextStatus(event.target.value)}
          aria-label={`Change status for ${orderNumber}`}
          className="h-8 min-w-[118px] px-2.5 text-xs"
        >
          <option value="" disabled>
            Change…
          </option>
          {nextStatuses.map((next) => (
            <option key={next} value={next}>
              {label(next)}
            </option>
          ))}
        </Select>
        <Button
          type="submit"
          size="sm"
          variant="outline"
          loading={isPending}
          disabled={!nextStatus}
          className="h-8 px-2.5 text-xs"
        >
          Save
        </Button>
      </div>
      {state.message ? (
        <p
          className={cn(
            "max-w-[180px] text-[11px] leading-snug",
            state.status === "error" ? "text-danger" : "text-success",
          )}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const [state, formAction, isPending] = useActionState(
    updateOrderStatusAction,
    initialState,
  );
  const nextStatuses = orderStatusTransitions[status];

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <Feedback state={state} />
      {nextStatuses.length === 0 ? (
        <p className="text-sm text-muted">
          This order has reached a final state. No further status changes are available.
        </p>
      ) : (
        <>
          <div>
            <Label htmlFor="status">Next status</Label>
            <Select id="status" name="status" defaultValue={nextStatuses[0]}>
              {nextStatuses.map((next) => (
                <option key={next} value={next}>
                  {label(next)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea id="note" name="note" rows={3} placeholder="Courier, tracking or internal note" />
          </div>
          <Button type="submit" loading={isPending} size="sm">
            Update order
          </Button>
          <p className="text-[11px] leading-relaxed text-muted">
            Delivering an order deducts on-hand stock. Cancelling releases reserved stock.
          </p>
        </>
      )}
    </form>
  );
}

const paymentOptions: PaymentStatus[] = [
  "unpaid",
  "paid",
  "partially_refunded",
  "refunded",
  "failed",
];

export function PaymentStatusForm({
  orderId,
  paymentStatus,
}: {
  orderId: string;
  paymentStatus: PaymentStatus;
}) {
  const [state, formAction, isPending] = useActionState(
    updatePaymentStatusAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <Feedback state={state} />
      <div>
        <Label htmlFor="paymentStatus">Payment status</Label>
        <Select id="paymentStatus" name="paymentStatus" defaultValue={paymentStatus}>
          {paymentOptions.map((status) => (
            <option key={status} value={status}>
              {label(status)}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" variant="outline" size="sm" loading={isPending}>
        Save payment
      </Button>
    </form>
  );
}

export function ConfirmPaymentForm({ orderId }: { orderId: string }) {
  const [state, formAction, isPending] = useActionState(
    confirmOrderPaymentAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="orderId" value={orderId} />
      <Feedback state={state} />
      <Button type="submit" size="sm" loading={isPending}>
        Confirm receipt & mark paid
      </Button>
      <p className="text-[11px] leading-relaxed text-muted">
        Only confirm after verifying the uploaded receipt against your account.
      </p>
    </form>
  );
}

export function OrderNoteForm({
  orderId,
  note,
}: {
  orderId: string;
  note: string | null;
}) {
  const [state, formAction, isPending] = useActionState(saveOrderNoteAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <Feedback state={state} />
      <div>
        <Label htmlFor="adminNote">Internal note</Label>
        <Textarea
          id="adminNote"
          name="adminNote"
          rows={4}
          defaultValue={note ?? ""}
          placeholder="Visible only to staff"
        />
      </div>
      <Button type="submit" variant="outline" size="sm" loading={isPending}>
        Save note
      </Button>
    </form>
  );
}
