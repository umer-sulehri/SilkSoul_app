"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CreditCard, Lock, Truck } from "lucide-react";
import { toast } from "sonner";
import { placeOrderAction, type CheckoutActionState } from "@/app/actions/checkout";
import { useCart } from "@/components/cart/cart-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { FieldError, HelperText, Label } from "@/components/ui/label";
import { Alert, EmptyState } from "@/components/ui/layout";
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/validations/schemas";
import { cartTotals } from "@/lib/pricing/cart";
import { isSupabaseConfigured } from "@/lib/env";
import { cn, formatCurrency } from "@/lib/utils";

const initialState: CheckoutActionState = {
  status: "idle",
  message: undefined,
  fieldErrors: undefined,
};

export function CheckoutForm({
  deliveryFee,
  freeThreshold,
  codEnabled,
}: {
  deliveryFee: number;
  freeThreshold: number;
  codEnabled: boolean;
}) {
  const { items, isHydrated } = useCart();
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(placeOrderAction, initialState);
  const connected = isSupabaseConfigured();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    mode: "onBlur",
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      postalCode: "",
      note: "",
      paymentMethod: "cod",
    },
  });

  useEffect(() => {
    // Generated on the client only so the checkout session has a stable key.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  useEffect(() => {
    if (!state.fieldErrors) return;
    for (const [field, message] of Object.entries(state.fieldErrors)) {
      if (field in checkoutFormSchema.shape) {
        setError(field as keyof CheckoutFormValues, { message });
      }
    }
  }, [state.fieldErrors, setError]);

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error("Order not placed", { description: state.message });
    }
  }, [state]);

  if (!isHydrated) {
    return <div className="h-96 animate-pulse rounded-[18px] bg-surface-soft" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing to check out yet"
        description="Add a product to your bag before continuing to checkout."
        action={
          <Link href="/products" className={buttonVariants({ size: "md" })}>
            Shop the collection
          </Link>
        }
      />
    );
  }

  const totals = cartTotals(items, freeThreshold, deliveryFee);

  const onSubmit = (values: CheckoutFormValues) => {
    if (pending) return;
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.set(key, value ?? "");
    });
    formData.set("idempotencyKey", idempotencyKey);
    formData.set(
      "items",
      JSON.stringify(items.map((item) => ({ productId: item.productId, quantity: item.quantity }))),
    );
    formAction(formData);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} noValidate className="grid items-start gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-6">
        {!connected ? (
          <Alert tone="warning" title="Preview mode">
            Checkout is disabled until Supabase is connected. The form, validation and server
            action are ready — no order will be created in this preview.
          </Alert>
        ) : null}

        {state.status === "error" && state.message ? (
          <Alert tone="danger" title="We could not place your order">
            {state.message}
          </Alert>
        ) : null}

        <section className="rounded-[18px] border border-border bg-surface p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">1</span>
            <h2 className="font-serif text-2xl text-ink">Contact</h2>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            We use these details only to confirm and deliver your order.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="customerName">Full name</Label>
              <Input
                id="customerName"
                autoComplete="name"
                {...register("customerName")}
                aria-invalid={Boolean(errors.customerName)}
                aria-describedby={errors.customerName ? "customerName-error" : undefined}
              />
              <FieldError id="customerName-error" message={errors.customerName?.message} />
            </div>
            <div>
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="03xx xxxxxxx"
                {...register("phone")}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              <FieldError id="phone-error" message={errors.phone?.message} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              <FieldError id="email-error" message={errors.email?.message} />
            </div>
          </div>
        </section>

        <section className="rounded-[18px] border border-border bg-surface p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">2</span>
            <h2 className="font-serif text-2xl text-ink">Delivery</h2>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            We currently deliver across Pakistan. Please give us a complete address.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="address">Street address</Label>
              <Textarea
                id="address"
                autoComplete="street-address"
                placeholder="House, street, area, landmark"
                {...register("address")}
                aria-invalid={Boolean(errors.address)}
                aria-describedby={errors.address ? "address-error" : undefined}
              />
              <FieldError id="address-error" message={errors.address?.message} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                autoComplete="address-level2"
                {...register("city")}
                aria-invalid={Boolean(errors.city)}
                aria-describedby={errors.city ? "city-error" : undefined}
              />
              <FieldError id="city-error" message={errors.city?.message} />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal code (optional)</Label>
              <Input
                id="postalCode"
                autoComplete="postal-code"
                {...register("postalCode")}
                aria-invalid={Boolean(errors.postalCode)}
              />
              <FieldError message={errors.postalCode?.message} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="note">Order note (optional)</Label>
              <Textarea
                id="note"
                placeholder="Delivery instructions, gift note, or anything else we should know"
                {...register("note")}
              />
              <HelperText>Visible to the SilkSoul team only.</HelperText>
              <FieldError message={errors.note?.message} />
            </div>
          </div>
        </section>

        <section className="rounded-[18px] border border-border bg-surface p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">3</span>
            <h2 className="font-serif text-2xl text-ink">Payment</h2>
          </div>
          <p className="mt-1.5 text-sm text-muted">
            Pay in cash when your order arrives. No card details are collected or stored.
          </p>
          <div className="mt-5">
            {codEnabled ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-primary/30 bg-primary/5 p-4">
                <input
                  type="radio"
                  value="cod"
                  defaultChecked
                  {...register("paymentMethod")}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" />
                    Cash on delivery
                  </span>
                  <span className="mt-1 block text-xs text-muted">
                    Pay the courier when your parcel arrives.
                  </span>
                </span>
              </label>
            ) : (
              <Alert tone="warning" title="No payment method available">
                Cash on delivery is currently disabled. Please contact us to place an order.
              </Alert>
            )}
            <FieldError message={errors.paymentMethod?.message} />
          </div>
        </section>
      </div>

      <aside className="rounded-[18px] border border-border bg-surface p-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-2xl text-ink">Order summary</h2>
        <ul className="mt-5 space-y-4">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-3">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-[10px] border border-border bg-surface-soft">
                <Image src={item.image} alt={item.name} fill sizes="56px" className="object-contain p-1" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white tabular-nums">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {formatCurrency(item.price, item.currency)} each
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums text-ink">
                {formatCurrency(item.price * item.quantity, item.currency)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
          <div className="flex justify-between text-muted">
            <dt>Subtotal</dt>
            <dd className="tabular-nums text-ink">{formatCurrency(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Delivery</dt>
            <dd className="tabular-nums text-ink">
              {totals.deliveryFee === 0 ? "Free" : formatCurrency(totals.deliveryFee)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-ink">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatCurrency(totals.total)}</dd>
          </div>
        </dl>

        {totals.remainingForFreeDelivery > 0 ? (
          <p className="mt-3 flex items-center gap-2 rounded-[10px] bg-surface-soft p-3 text-xs text-muted">
            <Truck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            Add {formatCurrency(totals.remainingForFreeDelivery)} more for free delivery.
          </p>
        ) : null}

        <Button type="submit" size="lg" className="mt-5 w-full" loading={pending} disabled={!connected || !codEnabled}>
          <Lock className="h-4 w-4" aria-hidden="true" />
          {connected ? "Place order" : "Connect Supabase to order"}
        </Button>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
          Stock and totals are verified on the server. You will receive an order reference
          after confirmation.
        </p>
        <Link href="/cart" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-2 w-full")}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to bag
        </Link>
      </aside>
    </form>
  );
}
