import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-provider";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/lib/env";
import { getStoreSettings } from "@/lib/data/products";
import { siteThemeStyle } from "@/lib/site-theme";
import "./globals.css";

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const displayFont = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "SilkSoul — Botanical Haircare",
    template: "%s | SilkSoul",
  },
  description: siteConfig.description,
  applicationName: "SilkSoul",
  keywords: [
    "SilkSoul",
    "natural hair oil",
    "sulphate free shampoo",
    "milky shampoo",
    "haircare",
    "skincare",
    "Pakistan",
  ],
  icons: {
    icon: "/images/logo.jpeg",
    apple: "/images/logo.jpeg",
  },
  openGraph: {
    type: "website",
    siteName: "SilkSoul",
    title: "SilkSoul — Let nature love your hair",
    description: siteConfig.description,
    images: [{ url: "/images/product-1-hair-oil.jpeg", alt: "SILK Soul Natural Hair Oil" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SilkSoul — Let nature love your hair",
    description: siteConfig.description,
  },
};

export async function generateViewport(): Promise<Viewport> {
  const settings = await getStoreSettings();
  return {
    themeColor: settings.theme.background,
    colorScheme: "light",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable}`}
      style={siteThemeStyle(settings.theme)}
    >
      <body className="min-h-dvh bg-background text-ink">
        <CartProvider>{children}</CartProvider>
        <Toaster />
      </body>
    </html>
  );
}
