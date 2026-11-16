"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  createQuotationAction,
  type DocumentActionState,
} from "@/app/admin/actions/documents";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

export type QuotationProductOption = {
  id: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
};

type Row = {
  key: string;
  productId: string;
  quantity: string;
  unitPrice: string;
};

const initialState: DocumentActionState = { status: "idle" };

function createRow(key: string, product?: QuotationProductOption): Row {
  return {
    key,
    productId: product?.id ?? "",
    quantity: "1",
    unitPrice: product ? String(product.price) : "",
  };
}

export function QuotationForm({
  products,
  defaultDeliveryFee,
  defaultValidity,
}: {
  products: QuotationProductOption[];
  defaultDeliveryFee: number;
  defaultValidity: string;
}) {
  const [state, formAction, isPending] = useActionState(
    createQuotationAction,
    initialState,
  );
  const nextKey = useRef(2);
  const [rows, setRows] = useState<Row[]>(() => [
    createRow("row-1", products[0]),
  ]);
  const [discountTotal, setDiscountTotal] = useState("0");
  const [deliveryFee, setDeliveryFee] = useState(String(defaultDeliveryFee));
  const [taxTotal, setTaxTotal] = useState("0");

  const currency = products[0]?.currency ?? "PKR";
  const subtotal = useMemo(
    () =>
      rows.reduce((total, row) => {
        const quantity = Number(row.quantity);
        const price = Number(row.unitPrice);
        if (!Number.isFinite(quantity) || !Number.isFinite(price)) return total;
        return total + quantity * price;
      }, 0),
    [rows],
  );

  const discount = Math.min(Math.max(Number(discountTotal) || 0, 0), subtotal);
  const delivery = Math.max(Number(deliveryFee) || 0, 0);
  const tax = Math.max(Number(taxTotal) || 0, 0);
  const grandTotal = subtotal - discount + delivery + tax;

  const items = rows
    .filter((row) => row.productId)
    .map((row) => ({
      productId: row.productId,
      quantity: Number(row.quantity) || 0,
      unitPrice: Number(row.unitPrice) || 0,
    }));

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function chooseProduct(key: string, productId: string) {
    const product = products.find((option) => option.id === productId);
    updateRow(key, {
      productId,
      unitPrice: product ? String(product.price) : "",
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      {state.message ? (
        <p
          className={
            state.status === "error"
              ? "rounded-[8px] border border-danger/25 bg-danger/5 px-3 py-2 text-sm text-ink"
              : "rounded-[8px] border border-success/25 bg-success/5 px-3 py-2 text-sm text-ink"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <section className="rounded-[16px] border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-serif text-xl text-ink">Customer</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="customerName">Full name</Label>
            <Input id="customerName" name="customerName" required maxLength={120} />
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone</Label>
            <Input id="customerPhone" name="customerPhone" required maxLength={30} />
          </div>
          <div>
            <Label htmlFor="customerEmail">Email (optional)</Label>
            <Input id="customerEmail" name="customerEmail" type="email" maxLength={160} />
          </div>
          <div>
            <Label htmlFor="customerCity">City</Label>
            <Input id="customerCity" name="customerCity" maxLength={80} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="customerAddress">Address</Label>
            <Input id="customerAddress" name="customerAddress" maxLength={300} />
          </div>
          <div>
            <Label htmlFor="customerPostalCode">Postal code</Label>
            <Input id="customerPostalCode" name="customerPostalCode" maxLength={12} />
          </div>
          <div>
            <Label htmlFor="validityDate">Valid until</Label>
            <Input
              id="validityDate"
              name="validityDate"
              type="date"
              defaultValue={defaultValidity}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[16px] border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-ink">Products</h2>
            <p className="text-xs text-muted">Adjust unit prices for a custom quote.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setRows((current) => [
                ...current,
                createRow(`row-${nextKey.current++}`, products[0]),
              ])
            }
            disabled={rows.length >= 50}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add line
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {rows.map((row, index) => (
            <div
              key={row.key}
              className="grid gap-3 rounded-[12px] border border-border/80 p-3 sm:grid-cols-[minmax(0,1fr)_90px_120px_auto] sm:items-end"
            >
              <div>
                <Label htmlFor={`product-${row.key}`}>Product {index + 1}</Label>
                <Select
                  id={`product-${row.key}`}
                  value={row.productId}
                  onChange={(event) => chooseProduct(row.key, event.target.value)}
                >
                  <option value="">Choose a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor={`quantity-${row.key}`}>Qty</Label>
                <Input
                  id={`quantity-${row.key}`}
                  type="number"
                  min="1"
                  max="999"
                  value={row.quantity}
                  onChange={(event) => updateRow(row.key, { quantity: event.target.value })}
                />
              </div>
              <div>
                <Label htmlFor={`price-${row.key}`}>Unit price</Label>
                <Input
                  id={`price-${row.key}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.unitPrice}
                  onChange={(event) => updateRow(row.key, { unitPrice: event.target.value })}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Remove line ${index + 1}`}
                onClick={() =>
                  setRows((current) =>
                    current.length === 1 ? current : current.filter((item) => item.key !== row.key),
                  )
                }
                disabled={rows.length === 1}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[16px] border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-serif text-xl text-ink">Totals and notes</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="discountTotal">Discount</Label>
            <Input
              id="discountTotal"
              name="discountTotal"
              type="number"
              min="0"
              step="0.01"
              value={discountTotal}
              onChange={(event) => setDiscountTotal(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="deliveryFee">Delivery charge</Label>
            <Input
              id="deliveryFee"
              name="deliveryFee"
              type="number"
              min="0"
              step="0.01"
              value={deliveryFee}
              onChange={(event) => setDeliveryFee(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="taxTotal">Tax (optional)</Label>
            <Input
              id="taxTotal"
              name="taxTotal"
              type="number"
              min="0"
              step="0.01"
              value={taxTotal}
              onChange={(event) => setTaxTotal(event.target.value)}
            />
          </div>
          <div aria-live="polite" className="rounded-[12px] bg-surface-soft p-4">
            <div className="flex justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal, currency)}</span>
            </div>
            {discount > 0 ? (
              <div className="mt-1 flex justify-between text-sm text-muted">
                <span>Discount</span>
                <span className="tabular-nums">-{formatCurrency(discount, currency)}</span>
              </div>
            ) : null}
            <div className="mt-1 flex justify-between text-sm text-muted">
              <span>Delivery</span>
              <span className="tabular-nums">{formatCurrency(delivery, currency)}</span>
            </div>
            {tax > 0 ? (
              <div className="mt-1 flex justify-between text-sm text-muted">
                <span>Tax</span>
                <span className="tabular-nums">{formatCurrency(tax, currency)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold text-ink">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(grandTotal, currency)}</span>
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="notes">Notes for the customer</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={4}
              maxLength={1500}
              placeholder="Lead time, delivery details or special terms"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={isPending} disabled={items.length === 0}>
          Create quotation
        </Button>
        <p className="text-xs text-muted">
          A quotation is not an order or proof of payment.
        </p>
      </div>
    </form>
  );
}
