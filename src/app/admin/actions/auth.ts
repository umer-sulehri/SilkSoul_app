"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/schemas";

export type LoginState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function signInAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "Supabase is not configured. Add the environment variables, run the migrations and seed, then create an admin user.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Check your email and password.", fieldErrors };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { status: "error", message: "The database is not reachable right now." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return {
      status: "error",
      message: "Those credentials did not match an account.",
    };
  }

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id);

  const allowed = (roles ?? []).some(
    (row) => row.role === "admin" || row.role === "staff",
  );

  if (!allowed) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "This account does not have access to the store admin.",
    };
  }

  redirect("/admin");
}

export async function signOutAction() {
  const { supabase } = await getSessionUser();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
