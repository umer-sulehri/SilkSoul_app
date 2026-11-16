"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  Star,
  Users,
  Warehouse,
} from "lucide-react";
import { signOutAction } from "@/app/admin/actions/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/quotations", label: "Quotations", icon: FileText },
  { href: "/admin/receipts", label: "Receipts", icon: ReceiptText },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/settings", label: "Store settings", icon: Settings },
  { href: "/admin/team", label: "Team access", icon: Users },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({
  email,
  roles,
  isAdmin,
}: {
  email: string;
  roles: string[];
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const visibleLinks = isAdmin ? links : links.filter((link) => link.href !== "/admin/team");

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col border-r border-border bg-surface px-4 py-6 lg:flex">
        <Link
          href="/admin"
          className="rounded-[10px] px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className="font-serif text-2xl leading-none tracking-tight">SilkSoul</span>
          <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Studio
          </span>
        </Link>

        <nav className="mt-9 flex flex-col gap-1" aria-label="Admin navigation">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(pathname, link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  active && "bg-primary/10 text-primary",
                )}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-border pt-5">
          <div className="px-3">
            <p className="truncate text-sm font-medium text-ink" title={email}>
              {email}
            </p>
            <p className="mt-0.5 text-xs capitalize text-muted">{roles.join(", ")}</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-xs text-muted transition-colors hover:bg-surface-soft hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            View storefront
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-xs text-muted transition-colors hover:bg-surface-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="border-b border-border bg-surface lg:hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4">
          <Link href="/admin" className="flex items-baseline gap-2">
            <span className="font-serif text-xl leading-none">SilkSoul</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Studio
            </span>
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-[8px] px-2 text-xs text-muted hover:bg-surface-soft hover:text-ink"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
        <nav
          className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none]"
          aria-label="Admin navigation"
        >
          {visibleLinks.map((link) => {
            const active = isActive(pathname, link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full border border-transparent px-3 py-1.5 text-xs font-medium text-muted",
                  active && "border-primary/20 bg-primary/10 text-primary",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
