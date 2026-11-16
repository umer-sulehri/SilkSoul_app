import { z } from "zod";

export const cartItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "Name is too long."),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid phone number.")
    .max(20, "Enter a valid phone number."),
  email: z
    .union([z.string().trim().email("Enter a valid email address."), z.literal("")])
    .optional(),
  address: z
    .string()
    .trim()
    .min(10, "Please enter your complete delivery address.")
    .max(300, "Address is too long."),
  city: z.string().trim().min(2, "Please enter your city.").max(80, "City is too long."),
  postalCode: z.string().trim().max(12, "Postal code is too long.").optional(),
  note: z.string().trim().max(500, "Order note is too long.").optional(),
  paymentMethod: z.enum(["cod"]),
  couponCode: z.string().trim().max(40).optional(),
  idempotencyKey: z.string().uuid("Your session expired. Please refresh and try again."),
  items: z.array(cartItemInputSchema).min(1, "Your cart is empty."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const trackOrderSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .min(4, "Enter your order reference.")
    .max(40, "Enter a valid order reference."),
  phone: z.string().trim().min(10, "Enter the phone number used for the order."),
});

export const reviewSchema = z.object({
  productId: z.string().uuid(),
  displayName: z
    .string()
    .trim()
    .min(2, "Please enter a display name.")
    .max(60, "Display name is too long."),
  rating: z.coerce.number().int().min(1, "Choose a rating.").max(5),
  title: z.string().trim().max(120, "Title is too long.").optional(),
  body: z
    .string()
    .trim()
    .min(10, "Please share a little more about your experience.")
    .max(1200, "Review is too long."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const orderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ]),
  note: z.string().trim().max(500).optional(),
});

export const inventoryAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  quantityDelta: z.coerce
    .number()
    .int()
    .refine((value) => value !== 0, "Enter a non-zero adjustment."),
  movementType: z.enum([
    "restock",
    "manual_adjustment",
    "damaged",
    "returned",
  ]),
  reason: z.string().trim().min(3, "Please provide a reason.").max(200),
  notes: z.string().trim().max(500).optional(),
});

const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex colour, for example #3e5a44.");

export const productFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Product name is required.").max(160),
  slug: z
    .string()
    .trim()
    .min(2, "Slug is required.")
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
  sku: z.string().trim().min(2, "SKU is required.").max(60),
  categoryId: z.string().uuid().optional().or(z.literal("")),
  shortDescription: z.string().trim().max(240).optional(),
  description: z.string().trim().max(4000).optional(),
  price: z.coerce.number().min(0, "Price cannot be negative."),
  compareAtPrice: z
    .union([z.coerce.number().min(0), z.literal("")])
    .optional(),
  stockOnHand: z.coerce.number().int().min(0, "Stock cannot be negative."),
  lowStockThreshold: z.coerce.number().int().min(0),
  benefits: z.string().max(2000).optional(),
  ingredients: z.string().max(2000).optional(),
  usageInstructions: z.string().max(3000).optional(),
  specifications: z.string().max(3000).optional(),
  seoTitle: z.string().trim().max(160).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  isActive: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  companionProductId: z.union([z.string().uuid(), z.literal("")]).optional(),
  themePrimary: hexColor,
  themeAccent: hexColor,
  themeSoft: hexColor,
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export const checkoutFormSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(120, "Name is too long."),
  phone: z
    .string()
    .trim()
    .min(10, "Enter a valid phone number.")
    .max(20, "Enter a valid phone number."),
  email: z
    .union([z.string().trim().email("Enter a valid email address."), z.literal("")])
    .optional(),
  address: z
    .string()
    .trim()
    .min(10, "Please enter your complete delivery address.")
    .max(300, "Address is too long."),
  city: z.string().trim().min(2, "Please enter your city.").max(80, "City is too long."),
  postalCode: z.string().trim().max(12, "Postal code is too long.").optional(),
  note: z.string().trim().max(500, "Order note is too long.").optional(),
  paymentMethod: z.enum(["cod"]),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const storeSettingsSchema = z.object({
  storeName: z.string().trim().min(2, "Store name is required.").max(120),
  supportEmail: z.string().trim().email("Enter a valid support email."),
  supportPhone: z.string().trim().min(7, "Enter a support phone number.").max(40),
  currency: z.string().trim().length(3, "Use a three-letter currency code.").toUpperCase(),
  deliveryFee: z.coerce.number().min(0, "Delivery fee cannot be negative."),
  freeDeliveryThreshold: z.coerce.number().min(0, "Threshold cannot be negative."),
  codEnabled: z.boolean(),
  announcement: z.string().trim().max(220).optional(),
  address: z.string().trim().max(300).optional(),
  instagram: z.string().trim().max(120).optional(),
});

export const couponFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code is too short.")
      .max(30, "Code is too long.")
      .regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, hyphens or underscores.")
      .transform((value) => value.toUpperCase()),
    description: z.string().trim().max(200).optional(),
    discountType: z.enum(["percentage", "fixed"]),
    discountValue: z.coerce.number().positive("Discount must be greater than zero."),
    minSubtotal: z.coerce.number().min(0).default(0),
    maxDiscount: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
    startsAt: z.string().trim().optional(),
    endsAt: z.string().trim().optional(),
    usageLimit: z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
    isActive: z.boolean(),
  })
  .refine(
    (value) => value.discountType !== "percentage" || value.discountValue <= 100,
    { message: "Percentage discounts cannot exceed 100%.", path: ["discountValue"] },
  )
  .refine(
    (value) => !value.startsAt || !value.endsAt || new Date(value.endsAt) > new Date(value.startsAt),
    { message: "The end date must be after the start date.", path: ["endsAt"] },
  );

export const quotationItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1.").max(999),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative.").max(10000000),
});

export const quotationFormSchema = z.object({
  customerName: z.string().trim().min(2, "Enter the customer name.").max(120),
  customerEmail: z
    .union([z.string().trim().email("Enter a valid email address."), z.literal("")])
    .optional(),
  customerPhone: z.string().trim().min(10, "Enter a valid phone number.").max(30),
  customerAddress: z.string().trim().max(300).optional(),
  customerCity: z.string().trim().max(80).optional(),
  customerPostalCode: z.string().trim().max(12).optional(),
  validityDate: z
    .string()
    .trim()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), "Enter a valid validity date."),
  notes: z.string().trim().max(1500).optional(),
  discountTotal: z.coerce.number().min(0).max(10000000),
  deliveryFee: z.coerce.number().min(0).max(1000000),
  taxTotal: z.coerce.number().min(0).max(1000000),
  items: z.array(quotationItemSchema).min(1, "Add at least one product.").max(50),
});

export type QuotationFormInput = z.infer<typeof quotationFormSchema>;
