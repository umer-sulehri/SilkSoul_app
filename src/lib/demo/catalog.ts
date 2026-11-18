import type { Product, StoreSettings } from "@/types/catalog";
import { defaultPaymentSettings } from "@/lib/payments";
import {
  defaultSiteImages,
  defaultSocialLinks,
} from "@/lib/site-content";
import { defaultSiteTheme } from "@/lib/site-theme";

const hairOil: Product = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "natural-hair-oil",
  name: "Natural Hair Oil",
  sku: "SS-HO-200",
  shortDescription:
    "A featherlight blend of seven botanicals for softer, stronger-looking hair.",
  description:
    "SILK Soul Natural Hair Oil is a nourishing blend of rosemary, coconut, almond, castor, argan, mustard and fenugreek oils. It helps improve hair softness, manageability and shine while supporting stronger-looking, healthier-feeling hair.",
  price: 2650,
  compareAtPrice: null,
  currency: "PKR",
  benefits: [
    "Nourishes the scalp and hair",
    "Helps reduce hair breakage",
    "Supports stronger-looking hair",
    "Improves hair softness and manageability",
    "Enhances natural shine",
  ],
  ingredients: [
    "Rosemary oil",
    "Coconut oil",
    "Almond oil",
    "Castor oil",
    "Argan oil",
    "Mustard oil",
    "Fenugreek oil",
  ],
  usageInstructions:
    "Apply a suitable amount of oil to the scalp and hair. Gently massage the scalp with fingertips. Distribute the oil evenly through the hair lengths. Leave on for 1–2 hours or as directed, then wash thoroughly with shampoo.",
  specifications: [
    { label: "Size", value: "200 ml / 6.7 fl. oz." },
    { label: "Packaging", value: "120 mm × 98 mm" },
    { label: "Hair type", value: "All hair types" },
    { label: "Key botanicals", value: "7 natural oils" },
    { label: "Finish", value: "Soft, natural shine" },
    { label: "Ritual", value: "Use 1–2 times weekly" },
  ],
  stockOnHand: 48,
  stockReserved: 0,
  lowStockThreshold: 8,
  availableStock: 48,
  isActive: true,
  isFeatured: true,
  companionProductId: "22222222-2222-4222-8222-222222222222",
  theme: { primary: "#3e5a44", accent: "#c19a5b", soft: "#e9efe1" },
  category: { id: "cat-hair-oils", name: "Hair Oils", slug: "hair-oils" },
  images: [
    {
      id: "img-hair-oil",
      path: "/images/product-1-hair-oil.jpeg",
      alt: "SILK Soul Natural Hair Oil bottle with botanical label",
      mediaType: "image",
      sortOrder: 0,
      isPrimary: true,
    },
  ],
  rating: { average: 0, count: 0 },
  reviews: [],
  seoTitle: "Natural Hair Oil | SILK Soul",
  seoDescription:
    "A nourishing blend of rosemary, coconut, almond, castor, argan, mustard and fenugreek oils for softer, stronger-looking hair.",
  archivedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const milkyShampoo: Product = {
  id: "22222222-2222-4222-8222-222222222222",
  slug: "milky-repair-smooth-shampoo",
  name: "Milky Repair & Smooth Shampoo",
  sku: "SS-SH-250",
  shortDescription:
    "A sulphate-free milky cleanse that leaves hair soft, smooth and manageable.",
  description:
    "SILK Soul Milky Repair & Smooth Shampoo is a gentle yet effective cleansing formula enriched with natural milky extracts. It helps remove dirt, oil and product buildup while nourishing and revitalising hair, leaving it clean, soft, smooth and naturally healthy-looking.",
  price: 2250,
  compareAtPrice: null,
  currency: "PKR",
  benefits: [
    "Gently cleanses scalp and hair",
    "Nourishes and conditions",
    "Helps remove dirt, oil and product buildup",
    "Improves softness and manageability",
    "Enhances natural shine",
    "Suitable for all hair types",
  ],
  ingredients: [
    "Natural milky extract blend",
    "Sulphate-free cleansing base",
    "Gentle conditioning agents",
  ],
  usageInstructions:
    "Wet your hair thoroughly. Take a suitable amount of shampoo and apply it to the scalp. Gently massage with the fingertips to create a rich lather. Rinse thoroughly with water. Repeat if needed.",
  specifications: [
    { label: "Size", value: "250 ml / 8.4 fl. oz." },
    { label: "Packaging", value: "154 mm × 112 mm" },
    { label: "Hair type", value: "All hair types" },
    { label: "Formula", value: "Sulphate free" },
    { label: "Key ingredient", value: "Milky extract" },
    { label: "Finish", value: "Soft, smooth and silky" },
  ],
  stockOnHand: 62,
  stockReserved: 0,
  lowStockThreshold: 10,
  availableStock: 62,
  isActive: true,
  isFeatured: true,
  companionProductId: "11111111-1111-4111-8111-111111111111",
  theme: { primary: "#6b5740", accent: "#c59a62", soft: "#f1e9dc" },
  category: { id: "cat-shampoos", name: "Shampoos", slug: "shampoos" },
  images: [
    {
      id: "img-milky-shampoo",
      path: "/images/product-2-milky-shampoo.jpeg",
      alt: "SILK Soul Milky Repair & Smooth Shampoo bottle with sulphate-free label",
      mediaType: "image",
      sortOrder: 0,
      isPrimary: true,
    },
  ],
  rating: { average: 0, count: 0 },
  reviews: [],
  seoTitle: "Milky Repair & Smooth Shampoo | SILK Soul",
  seoDescription:
    "A sulphate-free shampoo enriched with milky extracts for clean, soft, smooth and manageable hair.",
  archivedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const demoProducts: Product[] = [hairOil, milkyShampoo];

export const demoStoreSettings: StoreSettings = {
  storeName: "SilkSoul",
  supportEmail: "silksoul26@gmail.com",
  supportPhone: "+92 325 2545556",
  currency: "PKR",
  deliveryFee: 250,
  freeDeliveryThreshold: 5000,
  codEnabled: true,
  payments: defaultPaymentSettings,
  announcement:
    "Complimentary delivery on orders over Rs 5,000 · Cash on delivery available",
  socialLinks: {
    ...defaultSocialLinks,
    instagram: "@silksoul_official",
  },
  images: defaultSiteImages,
  theme: defaultSiteTheme,
};

export const demoSettings = demoStoreSettings;
