import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Database } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminContext } from "@/lib/auth/admin";
import { getStoreSettings } from "@/lib/data/products";
import { siteImageSrc } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const [context, settings, params] = await Promise.all([
    getAdminContext(),
    getStoreSettings(),
    searchParams,
  ]);

  if (context.user && context.isStaff) redirect("/admin");

  return (
    <main className="flex min-h-dvh flex-col bg-background">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 py-6 sm:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="SilkSoul home"
        >
          <span className="relative h-9 w-9 overflow-hidden rounded-full bg-surface-soft">
            <Image
              src={siteImageSrc(settings.images.logo)}
              alt=""
              fill
              sizes="36px"
              className="object-cover"
            />
          </span>
          <span className="font-serif text-2xl leading-none tracking-tight">SilkSoul</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Store
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-[20px] border border-border bg-surface p-7 shadow-soft sm:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Studio
            </p>
            <h1 className="mt-2 font-serif text-3xl text-ink">Admin sign in</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Manage the SilkSoul catalog, inventory and orders.
            </p>

            <div className="mt-7">
              {context.configured ? (
                <LoginForm />
              ) : (
                <div className="space-y-4 text-sm leading-relaxed text-muted">
                  <div className="flex items-start gap-3 rounded-[14px] border border-warning/30 bg-warning/10 p-4 text-ink">
                    <Database className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Backend not connected</p>
                      <p className="mt-1 text-muted">
                        Admin needs Supabase. Add the project URL and keys to{" "}
                        <code className="rounded bg-surface-soft px-1 py-0.5 text-xs">.env.local</code>,
                        run the migrations in order, then seed the catalog.
                      </p>
                    </div>
                  </div>
                  <ol className="list-decimal space-y-1 pl-5">
                    <li>Create a Supabase project.</li>
                    <li>Run `0001_init.sql`, `0002_functions.sql`, `0003_rls.sql`.</li>
                    <li>Run `supabase/seed.sql`.</li>
                    <li>Create a user, then grant the admin role in SQL.</li>
                  </ol>
                  <p className="text-xs">
                    The storefront remains available in preview mode with the seed catalog.
                  </p>
                </div>
              )}
            </div>

            {params.setup ? (
              <p className="mt-5 rounded-[10px] bg-surface-soft px-3 py-2 text-xs text-muted">
                Connect Supabase and sign in with a staff account to open the studio.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
