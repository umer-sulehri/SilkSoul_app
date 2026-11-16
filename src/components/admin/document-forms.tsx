"use client";

import { useActionState } from "react";
import { ArrowRight, FileCheck2, ReceiptText } from "lucide-react";
import {
  convertQuotationAction,
  generateReceiptAction,
  updateQuotationStatusAction,
  type DocumentActionState,
} from "@/app/admin/actions/documents";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QuotationStatus } from "@/types/database";

const initialState: DocumentActionState = { status: "idle" };

const nextStatuses: Record<QuotationStatus, QuotationStatus[]> = {
  draft: ["sent", "accepted", "rejected", "expired"],
  sent: ["accepted", "rejected", "expired"],
  accepted: [],
  rejected: [],
  expired: [],
};

export function QuotationStatusForm({
  quotationId,
  status,
}: {
  quotationId: string;
  status: QuotationStatus;
}) {
  const [state, formAction, isPending] = useActionState(
    updateQuotationStatusAction,
    initialState,
  );
  const options = nextStatuses[status];

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="quotationId" value={quotationId} />
      {state.message ? (
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
      ) : null}
      {options.length === 0 ? (
        <p className="text-sm text-muted">
          {status === "accepted"
            ? "This quotation can now be converted into an order."
            : "No further status changes are available."}
        </p>
      ) : (
        <>
          <div>
            <Label htmlFor="quotationStatus">Next status</Label>
            <Select id="quotationStatus" name="status" defaultValue={options[0]}>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" size="sm" variant="outline" loading={isPending}>
            Update status
          </Button>
        </>
      )}
    </form>
  );
}

export function ConvertQuotationForm({ quotationId }: { quotationId: string }) {
  return (
    <form
      action={convertQuotationAction}
      onSubmit={(event) => {
        if (!window.confirm("Convert this quotation into an order and reserve stock?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="quotationId" value={quotationId} />
      <Button type="submit" size="sm">
        <FileCheck2 className="h-4 w-4" aria-hidden="true" />
        Convert to order
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </form>
  );
}

export function GenerateReceiptForm({
  orderId,
  paymentStatus,
}: {
  orderId: string;
  paymentStatus: string;
}) {
  return (
    <form action={generateReceiptAction}>
      <input type="hidden" name="orderId" value={orderId} />
      <Button type="submit" size="sm" variant="outline">
        <ReceiptText className="h-4 w-4" aria-hidden="true" />
        Generate receipt
      </Button>
      <p className="mt-2 text-[11px] text-muted">
        The receipt records the current payment status ({paymentStatus.replaceAll("_", " ")}).
      </p>
    </form>
  );
}
