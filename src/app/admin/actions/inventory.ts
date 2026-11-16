"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/auth/admin";
import { inventoryAdjustmentSchema } from "@/lib/validations/schemas";

export type InventoryActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function adjustInventoryAction(
  _previousState: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const context = await getAdminContext();
  if (!context.isStaff || !context.supabase) {
    return { status: "error", message: "You do not have permission to adjust stock." };
  }

  const parsed = inventoryAdjustmentSchema.safeParse({
    productId: formData.get("productId"),
    quantityDelta: formData.get("quantityDelta"),
    movementType: formData.get("movementType"),
    reason: formData.get("reason"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Check the adjustment details.", fieldErrors };
  }

  const { error } = await context.supabase.rpc("adjust_inventory", {
    p_product_id: parsed.data.productId,
    p_on_hand_delta: parsed.data.quantityDelta,
    p_movement_type: parsed.data.movementType,
    p_reason: parsed.data.reason,
    p_notes: parsed.data.notes ?? "",
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath(`/admin/inventory/${parsed.data.productId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  revalidatePath("/products");
  return { status: "success", message: "Stock updated and movement recorded." };
}
