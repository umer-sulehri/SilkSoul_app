import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PreviewBanner } from "@/components/layout/preview-banner";
import { getStoreSettings } from "@/lib/data/products";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <div className="flex min-h-dvh flex-col">
      <PreviewBanner />
      <SiteHeader settings={settings} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
