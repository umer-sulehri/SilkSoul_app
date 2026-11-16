import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

export type AdminContext = {
  configured: boolean;
  supabase: Awaited<ReturnType<typeof getSessionUser>>["supabase"];
  user: Awaited<ReturnType<typeof getSessionUser>>["user"];
  roles: UserRole[];
  isStaff: boolean;
  isAdmin: boolean;
};

export async function getAdminContext(): Promise<AdminContext> {
  const { supabase, user } = await getSessionUser();

  if (!supabase) {
    return {
      configured: false,
      supabase: null,
      user: null,
      roles: [],
      isStaff: false,
      isAdmin: false,
    };
  }

  if (!user) {
    return {
      configured: true,
      supabase,
      user: null,
      roles: [],
      isStaff: false,
      isAdmin: false,
    };
  }

  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const roles = (data ?? []).map((row) => row.role);
  const isAdmin = roles.includes("admin");

  return {
    configured: true,
    supabase,
    user,
    roles,
    isAdmin,
    isStaff: isAdmin || roles.includes("staff"),
  };
}

export async function requireStaff() {
  const context = await getAdminContext();

  if (!context.configured) {
    redirect("/admin/login?setup=1");
  }

  if (!context.user || !context.isStaff) {
    redirect("/admin/login");
  }

  return context;
}

export async function requireAdmin() {
  const context = await requireStaff();

  if (!context.isAdmin) {
    redirect("/admin?error=admin-only");
  }

  return context;
}
