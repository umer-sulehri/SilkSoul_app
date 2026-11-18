import { productImageUrl } from "@/lib/images";

export const socialPlatforms = ["instagram", "facebook", "tiktok"] as const;

export type SocialPlatform = (typeof socialPlatforms)[number];

export type SocialLinks = Record<SocialPlatform, string>;

export const defaultSocialLinks: SocialLinks = {
  instagram: "",
  facebook: "",
  tiktok: "",
};

export const siteImageKeys = [
  "logo",
  "homeRitualOil",
  "homeRitualShampoo",
  "aboutHeroOil",
  "aboutHeroShampoo",
  "socialPreview",
] as const;

export type SiteImageKey = (typeof siteImageKeys)[number];

export type SiteImages = Record<SiteImageKey, string>;

export const defaultSiteImages: SiteImages = {
  logo: "/images/logo.jpeg",
  homeRitualOil: "/images/product-1-hair-oil.jpeg",
  homeRitualShampoo: "/images/product-2-milky-shampoo.jpeg",
  aboutHeroOil: "/images/product-1-hair-oil.jpeg",
  aboutHeroShampoo: "/images/product-2-milky-shampoo.jpeg",
  socialPreview: "/images/product-1-hair-oil.jpeg",
};

export const siteImageLabels: Record<SiteImageKey, { label: string; hint: string }> = {
  logo: {
    label: "Store logo",
    hint: "Used in the header, footer and browser icon.",
  },
  homeRitualOil: {
    label: "Home page ritual — oil",
    hint: "First image in the “Two steps” section on the home page.",
  },
  homeRitualShampoo: {
    label: "Home page ritual — shampoo",
    hint: "Second image in the “Two steps” section on the home page.",
  },
  aboutHeroOil: {
    label: "Our story — oil",
    hint: "First image in the Our story hero.",
  },
  aboutHeroShampoo: {
    label: "Our story — shampoo",
    hint: "Second image in the Our story hero.",
  },
  socialPreview: {
    label: "Social share image",
    hint: "Shown when the store link is shared on social media.",
  },
};

export const socialLabels: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
};

export const socialPlaceholders: Record<SocialPlatform, string> = {
  instagram: "https://instagram.com/silksoul",
  facebook: "https://facebook.com/silksoul",
  tiktok: "https://tiktok.com/@silksoul",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function socialLinksFromSocials(socials: unknown): SocialLinks {
  const root = asRecord(socials);
  const links = asRecord(root?.links);

  return {
    instagram: readString(links?.instagram) ?? readString(root?.instagram) ?? "",
    facebook: readString(links?.facebook) ?? "",
    tiktok: readString(links?.tiktok) ?? "",
  };
}

export function siteImagesFromSocials(socials: unknown): SiteImages {
  const root = asRecord(socials);
  const images = asRecord(root?.images);

  return siteImageKeys.reduce<SiteImages>((result, key) => {
    const value = readString(images?.[key]) ?? defaultSiteImages[key];
    result[key] = value;
    return result;
  }, { ...defaultSiteImages });
}

export function siteImageSrc(value: string) {
  return productImageUrl(value);
}

export function socialProfileUrl(platform: SocialPlatform, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const handle = trimmed.replace(/^@/, "");
  if (platform === "instagram") return `https://instagram.com/${handle}`;
  if (platform === "facebook") return `https://facebook.com/${handle}`;
  return `https://tiktok.com/@${handle.replace(/^@/, "")}`;
}
