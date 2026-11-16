"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/auth/admin";
import type { UserRole } from "@/types/database";

export type TeamActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const roles: UserRole[] = ["admin", "staff", "customer"];

export async function setUserRoleAction(
  _previousState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const context = await getAdminContext();
  if (!context.isAdmin || !context.supabase) {
    return { status: "error", message: "Only administrators can change roles." };
  }

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;

  if (!userId || !roles.includes(role)) {
    return { status: "error", message: "Choose a valid person and role." };
  }

  const { error } = await context.supabase.rpc("admin_set_user_role", {
    p_user_id: userId,
    p_role: role,
  });

  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin/team");
  return { status: "success", message: `Role ${role} granted.` };
}

export async function removeUserRoleAction(formData: FormData) {
  const context = await getAdminContext();
  if (!context.isAdmin || !context.supabase) return;

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;
  if (!userId || !roles.includes(role)) return;

  if (userId === context.user?.id && role === "admin") return;

  if (role === "customer") return;

  await context.supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);

  await context.supabase.from("audit_logs").insert({
    actor_user_id: context.user?.id ?? null,
    action: "user.role_removed",
    entity_type: "user",
    entity_id: userId,
    details: { role },
  });

  revalidatePath("/admin/team");
}
