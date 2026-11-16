"use client";

import { useActionState } from "react";
import { adjustInventoryAction, type InventoryActionState } from "@/app/admin/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FieldError, HelperText, Label } from "@/components/ui/label";

const initialState: InventoryActionState = { status: "idle" };

export function InventoryAdjustmentForm({ productId }: { productId: string }) {
  const [state, formAction, isPending] = useActionState(
    adjustInventoryAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="productId" value={productId} />

      {state.message ? (
        <div
          className={
            state.status === "error"
              ? "rounded-[10px] border border-danger/25 bg-danger/5 px-3 py-2 text-sm"
              : "rounded-[10px] border border-success/25 bg-success/5 px-3 py-2 text-sm"
          }
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="quantityDelta">Quantity change</Label>
          <Input
            id="quantityDelta"
            name="quantityDelta"
            type="number"
            step="1"
            required
            placeholder="e.g. 12 or -2"
            aria-invalid={Boolean(state.fieldErrors?.quantityDelta)}
          />
          <FieldError message={state.fieldErrors?.quantityDelta} />
          <HelperText>Use a negative number for damage, loss or corrections.</HelperText>
        </div>
        <div>
          <Label htmlFor="movementType">Reason type</Label>
          <Select id="movementType" name="movementType" defaultValue="restock">
            <option value="restock">Restock</option>
            <option value="manual_adjustment">Manual adjustment</option>
            <option value="damaged">Damaged / lost</option>
            <option value="returned">Returned to stock</option>
          </Select>
          <FieldError message={state.fieldErrors?.movementType} />
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Reason</Label>
        <Input
          id="reason"
          name="reason"
          required
          placeholder="New stock delivery"
          aria-invalid={Boolean(state.fieldErrors?.reason)}
        />
        <FieldError message={state.fieldErrors?.reason} />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} placeholder="Optional internal note" />
        <FieldError message={state.fieldErrors?.notes} />
      </div>

      <Button type="submit" loading={isPending}>
        Record adjustment
      </Button>
    </form>
  );
}
