import type { Metadata } from "next";
import Link from "next/link";
import { Check, CircleDashed, MapPin, PackageCheck, Phone } from "lucide-react";
import { Container } from "@/components/ui/layout";
import { Alert } from "@/components/ui/layout";
import { StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { getOrderByToken } from "@/lib/data/orders";
import { paymentMethodLabel } from "@/lib/payments";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OrderStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

type Params = Promise<{ reference: string }>;
type SearchParams = Promise<{ token?: string }>;

const journey: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { reference } = await params;
  const { token } = await searchParams;
  const { order, configured } = token
    ? await getOrderByToken(reference, token)
    : { order: null, configured: false };

  if (!configured) {
    return (
      <Container size="narrow" className="py-20">
        <Alert tone="warning" title="Supabase is not connected">
          Order confirmation details are private. Connect Supabase and run the migrations to
          enable secure order confirmation pages.
        </Alert>
        <Link href="/products" className={buttonVariants({ className: "mt-6" })}>
          Back to shop
        </Link>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container size="narrow" className="py-20">
        <Alert tone="danger" title="We could not open this order">
          The confirmation link is invalid or has expired. Use order tracking with your order
          reference and phone number instead.
        </Alert>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/track-order" className={buttonVariants({})}>Track order</Link>
          <Link href="/contact" className={buttonVariants({ variant: "outline" })}>Contact us</Link>
        </div>
      </Container>
    );
  }

  const currentIndex = journey.indexOf(order.status);
  const cancelled = order.status === "cancelled" || order.status === "returned";

  return (
    <div className="pb-24 pt-12">
      <ClearCartOnMount />
      <Container size="narrow">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-success">
            Order received
          </p>
          <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">
            Thank you, {order.customerName.split(" ")[0]}.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Your order <span className="font-semibold text-ink">{order.orderNumber}</span> has
            been placed. We will confirm it by phone before dispatch.
          </p>
        </div>

        <div className="mt-10 rounded-[20px] border border-border bg-surface p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Order reference</p>
              <p className="mt-1 font-serif text-2xl text-ink tabular-nums">{order.orderNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} />
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>

          <ol className="mt-6 grid gap-3 sm:grid-cols-5">
            {journey.map((status, index) => {
              const active = !cancelled && index <= currentIndex;
              const current = !cancelled && index === currentIndex;
              return (
                <li key={status} className="flex items-center gap-2 sm:flex-col sm:items-start">
                  <span
                    className={
                      active
                        ? "flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white"
                        : "flex h-7 w-7 items-center justify-center rounded-full bg-surface-soft text-muted"
                    }
                  >
                    {active ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <CircleDashed className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </span>
                  <span className={current ? "text-xs font-semibold text-ink" : "text-xs text-muted"}>
                    {status.replace(/^\w/, (char) => char.toUpperCase())}
                  </span>
                </li>
              );
            })}
          </ol>
          {cancelled ? (
            <p className="mt-4 rounded-[10px] bg-danger/5 px-3 py-2 text-xs text-danger">
              This order is marked {order.status}. Please contact us if you need help.
            </p>
          ) : null}

          <ul className="mt-6 divide-y divide-border border-t border-border">
            {order.items.map((item) => (
              <li key={`${item.productName}-${item.productSku}`} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{item.productName}</p>
                  <p className="text-xs text-muted">
                    Qty {item.quantity} · {formatCurrency(item.unitPrice, order.currency)}
                  </p>
                </div>
                <p className="font-semibold tabular-nums text-ink">
                  {formatCurrency(item.lineTotal, order.currency)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd className="tabular-nums text-ink">{formatCurrency(order.subtotal, order.currency)}</dd>
            </div>
            {order.discountTotal > 0 ? (
              <div className="flex justify-between text-muted">
                <dt>Discount</dt>
                <dd className="tabular-nums text-success">−{formatCurrency(order.discountTotal, order.currency)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between text-muted">
              <dt>Delivery</dt>
              <dd className="tabular-nums text-ink">
                {order.deliveryFee === 0 ? "Free" : formatCurrency(order.deliveryFee, order.currency)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-ink">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatCurrency(order.grandTotal, order.currency)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[16px] border border-border bg-surface p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              Delivery
            </p>
            <p className="mt-2 text-sm text-muted">{order.city}</p>
            <p className="mt-1 text-xs text-muted">Placed {formatDate(order.placedAt)}</p>
          </div>
          <div className="rounded-[16px] border border-border bg-surface p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <PackageCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Payment
            </p>
            <p className="mt-2 text-sm capitalize text-muted">
              {paymentMethodLabel(order.paymentMethod)} ·{" "}
              {order.paymentStatus === "paid" ? "Paid" : "Payment pending"}
            </p>
            <p className="mt-1 text-xs text-muted">
              {order.paymentMethod === "cod"
                ? "Cash on delivery is marked paid only after collection."
                : "Advance payments are confirmed after we verify your uploaded receipt."}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/track-order" className={buttonVariants({ variant: "outline" })}>
            <Phone className="h-4 w-4" aria-hidden="true" />
            Track this order
          </Link>
          <Link href="/products" className={buttonVariants({})}>Continue shopping</Link>
        </div>
      </Container>
    </div>
  );
}
