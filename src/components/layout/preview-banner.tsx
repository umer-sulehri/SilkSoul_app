import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/env";

export function PreviewBanner() {
  if (isSupabaseConfigured()) return null;

  return (
    <div className="border-b border-accent/30 bg-accent/10">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-5 py-2 text-center text-xs text-accent-ink sm:px-8">
        <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="font-medium">Preview mode.</span>
        <span>Catalog is loaded from the seed snapshot. Connect Supabase to enable live checkout, orders and admin.</span>
        <Link href="/admin" className="font-semibold underline underline-offset-2">
          Setup
        </Link>
      </div>
    </div>
  );
}
