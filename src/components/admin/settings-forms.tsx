"use client";

import { useActionState, useState } from "react";
import {
  createCouponAction,
  saveStoreSettingsAction,
  type CouponActionState,
  type SettingsActionState,
} from "@/app/admin/actions/settings";
import { ColorField } from "@/components/admin/color-field";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FieldError, HelperText, Label } from "@/components/ui/label";
import { paymentSettingsFromSocials } from "@/lib/payments";
import {
  siteImageKeys,
  siteImageLabels,
  siteImagesFromSocials,
  siteImageSrc,
  socialLabels,
  socialLinksFromSocials,
  socialPlaceholders,
  socialPlatforms,
} from "@/lib/site-content";
import { siteThemeFieldNames, siteThemeFromSocials } from "@/lib/site-theme";
import type { SiteTheme } from "@/types/catalog";
import type { StoreSettingsRow } from "@/types/database";

const initialSettings: SettingsActionState = { status: "idle" };
const initialCoupon: CouponActionState = { status: "idle" };

const themeFields: { key: keyof SiteTheme; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Page background" },
  { key: "surface", label: "Surface / cards" },
  { key: "surfaceSoft", label: "Soft surface" },
  { key: "border", label: "Borders" },
  { key: "ink", label: "Heading text" },
  { key: "muted", label: "Body text" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "danger", label: "Danger" },
];

function SiteThemeEditor({
  defaults,
  errors,
}: {
  defaults: SiteTheme;
  errors: Record<string, string> | undefined;
}) {
  const [theme, setTheme] = useState(defaults);
  const update = (key: keyof SiteTheme) => (value: string) =>
    setTheme((current) => ({ ...current, [key]: value }));

  return (
    <div className="mt-5 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {themeFields.map((field) => (
          <ColorField
            key={field.key}
            id={siteThemeFieldNames[field.key]}
            name={siteThemeFieldNames[field.key]}
            label={field.label}
            value={theme[field.key]}
            onChange={update(field.key)}
            error={errors?.[siteThemeFieldNames[field.key]]}
          />
        ))}
      </div>

      <div
        className="overflow-hidden rounded-[18px] border"
        style={{ background: theme.background, borderColor: theme.border }}
        data-site-theme-preview
      >
        <div
          className="flex items-center justify-between gap-3 border-b px-4 py-3"
          style={{ background: theme.surface, borderColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-6 w-6 rounded-full"
              style={{ background: theme.primary }}
              aria-hidden="true"
            />
            <span className="font-serif text-sm" style={{ color: theme.ink }}>
              SilkSoul
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: theme.muted }}>
            <span>Shop</span>
            <span>Our story</span>
            <span>Contact</span>
          </div>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-[1.15fr_0.85fr]">
          <div
            className="rounded-[12px] border p-4"
            style={{ background: theme.surface, borderColor: theme.border }}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: theme.primary }}>
              Botanical haircare
            </p>
            <p className="mt-1 font-serif text-lg leading-tight" style={{ color: theme.ink }}>
              Let nature love your hair
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: theme.muted }}>
              A live preview of the colours used across the storefront.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-3 py-1.5 text-[10px] font-semibold"
                style={{ background: theme.primary, color: theme.surface }}
                data-theme-preview-primary
              >
                Shop now
              </span>
              <span
                className="rounded-full border px-3 py-1.5 text-[10px] font-medium"
                style={{ background: theme.surfaceSoft, borderColor: theme.border, color: theme.ink }}
              >
                Soft surface
              </span>
              <span
                className="h-2.5 w-8 rounded-full"
                style={{ background: theme.accent }}
                aria-hidden="true"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-2">
            {[
              { label: "Primary", value: theme.primary },
              { label: "Accent", value: theme.accent },
              { label: "Ink", value: theme.ink },
              { label: "Muted", value: theme.muted },
              { label: "Success", value: theme.success },
              { label: "Danger", value: theme.danger },
            ].map((swatch) => (
              <div
                key={swatch.label}
                className="overflow-hidden rounded-[9px] border"
                style={{ borderColor: theme.border }}
                data-theme-swatch={swatch.label}
              >
                <div className="h-7" style={{ background: swatch.value }} />
                <p
                  className="bg-white/70 px-1.5 py-1 text-[8px] font-medium uppercase tracking-[0.06em]"
                  style={{ color: "#1f2d23" }}
                >
                  {swatch.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoreSettingsForm({ settings }: { settings: StoreSettingsRow }) {
  const [state, formAction, isPending] = useActionState(
    saveStoreSettingsAction,
    initialSettings,
  );
  const savedTheme = siteThemeFromSocials(settings.socials);
  const savedPayments = paymentSettingsFromSocials(settings.socials);
  const savedSocials = socialLinksFromSocials(settings.socials);
  const savedImages = siteImagesFromSocials(settings.socials);
  const [themeResetKey, setThemeResetKey] = useState(0);

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
      </div>

      <div className="border-t border-border pt-6">
        <div>
          <h3 className="font-serif text-lg text-ink">Social links</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Add your profile links or handles. These appear in the storefront footer and
            contact page so customers can follow you.
          </p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {socialPlatforms.map((platform) => (
            <div key={platform}>
              <Label htmlFor={platform}>{socialLabels[platform]}</Label>
              <Input
                id={platform}
                name={platform}
                defaultValue={savedSocials[platform]}
                placeholder={socialPlaceholders[platform]}
              />
              <HelperText>Full URL or @handle.</HelperText>
              <FieldError message={state.fieldErrors?.[platform]} />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div>
          <h3 className="font-serif text-lg text-ink">Website images</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Replace any picture shown on the storefront. Product photos are managed from
            the products section.
          </p>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          {siteImageKeys.map((key) => (
            <div key={key}>
              <input type="hidden" name={`${key}Current`} value={savedImages[key]} />
              <ImageUploadField
                id={`${key}File`}
                name={`${key}File`}
                label={siteImageLabels[key].label}
                hint={siteImageLabels[key].hint}
                currentSrc={siteImageSrc(savedImages[key])}
              />
              <FieldError message={state.fieldErrors?.[`${key}File`]} />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div>
          <h3 className="font-serif text-lg text-ink">Payment methods</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Choose the options customers can use at checkout. Advance and JazzCash orders
            require the customer to upload a payment receipt for staff confirmation.
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <label className="flex items-start gap-3 rounded-[12px] border border-border p-4 text-sm">
            <input
              type="checkbox"
              name="codEnabled"
              defaultChecked={settings.cod_enabled}
              className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
            />
            <span>
              <span className="font-medium text-ink">Cash on delivery</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                Customers pay the courier when the parcel arrives. No receipt is required.
              </span>
            </span>
          </label>

          <div className="rounded-[12px] border border-border p-4">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="advancePaymentEnabled"
                defaultChecked={savedPayments.advance.enabled}
                className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
              />
              <span>
                <span className="font-medium text-ink">Advance payment</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                  Show your card or bank transfer details and ask for a receipt upload.
                </span>
              </span>
            </label>
            <div className="mt-4">
              <Label htmlFor="advancePaymentDetails">Card / bank details</Label>
              <Textarea
                id="advancePaymentDetails"
                name="advancePaymentDetails"
                rows={4}
                defaultValue={savedPayments.advance.details}
                placeholder={"Account title: SilkSoul\nBank / card: ...\nAccount number: ..."}
              />
              <HelperText>Shown to customers after they choose advance payment.</HelperText>
              <FieldError message={state.fieldErrors?.advancePaymentDetails} />
            </div>
          </div>

          <div className="rounded-[12px] border border-border p-4">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="jazzcashEnabled"
                defaultChecked={savedPayments.jazzcash.enabled}
                className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
              />
              <span>
                <span className="font-medium text-ink">JazzCash</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                  Show your JazzCash account and ask for a receipt upload.
                </span>
              </span>
            </label>
            <div className="mt-4">
              <Label htmlFor="jazzcashDetails">JazzCash details</Label>
              <Textarea
                id="jazzcashDetails"
                name="jazzcashDetails"
                rows={4}
                defaultValue={savedPayments.jazzcash.details}
                placeholder={"Account name: SilkSoul\nJazzCash number: 03xx xxxxxxx"}
              />
              <HelperText>Shown to customers after they choose JazzCash.</HelperText>
              <FieldError message={state.fieldErrors?.jazzcashDetails} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg text-ink">Website theme</h3>
            <p className="mt-1 max-w-xl text-sm text-muted">
              These colours control the full storefront palette, including backgrounds,
              cards, buttons, text, borders and status colours.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setThemeResetKey((value) => value + 1)}
            className="rounded-[9px] border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-surface-soft"
          >
            Discard changes
          </button>
        </div>
        <SiteThemeEditor
          key={themeResetKey}
          defaults={savedTheme}
          errors={state.fieldErrors}
        />
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
