"use client";

import { useActionState } from "react";
import {
  createCouponAction,
  saveStoreSettingsAction,
  type CouponActionState,
  type SettingsActionState,
} from "@/app/admin/actions/settings";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FieldError, HelperText, Label } from "@/components/ui/label";
import type { StoreSettingsRow } from "@/types/database";

const initialSettings: SettingsActionState = { status: "idle" };
const initialCoupon: CouponActionState = { status: "idle" };

function getInstagram(socials: unknown) {
  if (socials && typeof socials === "object" && !Array.isArray(socials)) {
    const value = (socials as Record<string, unknown>).instagram;
    return typeof value === "string" ? value : "";
  }
  return "";
}

export function StoreSettingsForm({ settings }: { settings: StoreSettingsRow }) {
  const [state, formAction, isPending] = useActionState(
    saveStoreSettingsAction,
    initialSettings,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="storeName">Store name</Label>
          <Input id="storeName" name="storeName" defaultValue={settings.store_name} required />
          <FieldError message={state.fieldErrors?.storeName} />
        </div>
        <div>
          <Label htmlFor="currency">Currency code</Label>
          <Input
            id="currency"
            name="currency"
            defaultValue={settings.currency}
            maxLength={3}
            required
          />
          <FieldError message={state.fieldErrors?.currency} />
        </div>
        <div>
          <Label htmlFor="supportEmail">Support email</Label>
          <Input
            id="supportEmail"
            name="supportEmail"
            type="email"
            defaultValue={settings.support_email}
            required
          />
          <FieldError message={state.fieldErrors?.supportEmail} />
        </div>
        <div>
          <Label htmlFor="supportPhone">Support phone</Label>
          <Input
            id="supportPhone"
            name="supportPhone"
            defaultValue={settings.support_phone}
            required
          />
          <FieldError message={state.fieldErrors?.supportPhone} />
        </div>
        <div>
          <Label htmlFor="deliveryFee">Delivery fee</Label>
          <Input
            id="deliveryFee"
            name="deliveryFee"
            type="number"
            min="0"
            step="1"
            defaultValue={Number(settings.delivery_fee)}
            required
          />
          <FieldError message={state.fieldErrors?.deliveryFee} />
        </div>
        <div>
          <Label htmlFor="freeDeliveryThreshold">Free delivery over</Label>
          <Input
            id="freeDeliveryThreshold"
            name="freeDeliveryThreshold"
            type="number"
            min="0"
            step="1"
            defaultValue={Number(settings.free_delivery_threshold)}
            required
          />
          <FieldError message={state.fieldErrors?.freeDeliveryThreshold} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="announcement">Announcement bar</Label>
          <Input
            id="announcement"
            name="announcement"
            defaultValue={settings.announcement ?? ""}
            maxLength={220}
          />
          <FieldError message={state.fieldErrors?.announcement} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address">Business address</Label>
          <Textarea
            id="address"
            name="address"
            rows={3}
            defaultValue={settings.address ?? ""}
          />
          <FieldError message={state.fieldErrors?.address} />
        </div>
        <div>
          <Label htmlFor="instagram">Instagram handle</Label>
          <Input
            id="instagram"
            name="instagram"
            defaultValue={getInstagram(settings.socials)}
            placeholder="@silksoul_official"
          />
          <FieldError message={state.fieldErrors?.instagram} />
        </div>
        <label className="flex items-start gap-3 self-end rounded-[10px] border border-border p-3 text-sm">
          <input
            type="checkbox"
            name="codEnabled"
            defaultChecked={settings.cod_enabled}
            className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
          />
          <span>
            <span className="font-medium text-ink">Cash on delivery</span>
            <span className="mt-0.5 block text-xs text-muted">
              Show COD as an available payment method at checkout.
            </span>
          </span>
        </label>
      </div>

      <Button type="submit" loading={isPending}>
        Save settings
      </Button>
    </form>
  );
}

export function CouponForm() {
  const [state, formAction, isPending] = useActionState(createCouponAction, initialCoupon);

  return (
    <form action={formAction} className="space-y-4" noValidate>
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
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" placeholder="WELCOME10" required />
          <FieldError message={state.fieldErrors?.code} />
        </div>
        <div>
          <Label htmlFor="discountType">Type</Label>
          <Select id="discountType" name="discountType" defaultValue="percentage">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </Select>
          <FieldError message={state.fieldErrors?.discountType} />
        </div>
        <div>
          <Label htmlFor="discountValue">Value</Label>
          <Input
            id="discountValue"
            name="discountValue"
            type="number"
            min="0.01"
            step="0.01"
            required
          />
          <FieldError message={state.fieldErrors?.discountValue} />
        </div>
        <div>
          <Label htmlFor="minSubtotal">Minimum subtotal</Label>
          <Input
            id="minSubtotal"
            name="minSubtotal"
            type="number"
            min="0"
            step="1"
            defaultValue={0}
          />
          <FieldError message={state.fieldErrors?.minSubtotal} />
        </div>
        <div>
          <Label htmlFor="maxDiscount">Maximum discount</Label>
          <Input id="maxDiscount" name="maxDiscount" type="number" min="0" step="1" />
          <HelperText>Optional cap for percentage codes.</HelperText>
        </div>
        <div>
          <Label htmlFor="usageLimit">Usage limit</Label>
          <Input id="usageLimit" name="usageLimit" type="number" min="1" step="1" />
          <HelperText>Optional total number of uses.</HelperText>
        </div>
        <div>
          <Label htmlFor="startsAt">Starts</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local" />
        </div>
        <div>
          <Label htmlFor="endsAt">Ends</Label>
          <Input id="endsAt" name="endsAt" type="datetime-local" />
          <FieldError message={state.fieldErrors?.endsAt} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" placeholder="Optional internal note" />
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          <span className="font-medium text-ink">Active immediately</span>
        </label>
      </div>

      <Button type="submit" loading={isPending}>
        Create discount code
      </Button>
    </form>
  );
}
