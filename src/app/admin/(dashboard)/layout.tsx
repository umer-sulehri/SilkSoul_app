import { AdminNav } from "@/components/admin/admin-nav";
import { requireStaff } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const context = await requireStaff();

  return (
    <div className="flex min-h-dvh flex-col bg-background lg:flex-row">
      <AdminNav
        email={context.user?.email ?? ""}
        roles={context.roles}
        isAdmin={context.isAdmin}
      />
      <main id="main-content" className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
