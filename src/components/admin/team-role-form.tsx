"use client";

import { useActionState } from "react";
import {
  removeUserRoleAction,
  setUserRoleAction,
  type TeamActionState,
} from "@/app/admin/actions/team";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import type { UserRole } from "@/types/database";

const initialState: TeamActionState = { status: "idle" };

export function TeamRoleForm({
  userId,
  roles,
  isSelf,
}: {
  userId: string;
  roles: string[];
  isSelf: boolean;
}) {
  const [state, formAction, isPending] = useActionState(setUserRoleAction, initialState);

  return (
    <div className="space-y-2">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="userId" value={userId} />
        <Select name="role" defaultValue="staff" className="h-9 w-36 text-xs">
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="customer">Customer</option>
        </Select>
        <Button type="submit" size="sm" variant="outline" loading={isPending}>
          Grant role
        </Button>
      </form>
      {state.message ? (
        <p
          className={
            state.status === "error" ? "text-xs text-danger" : "text-xs text-success"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      {roles.filter((role) => role !== "customer").length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {roles
            .filter((role) => role !== "customer")
            .map((role) => {
              const canRemove = !(isSelf && role === "admin");
              return (
                <span
                  key={role}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-soft px-2 py-0.5 text-[11px] capitalize text-muted"
                >
                  {role}
                  {canRemove ? (
                    <form action={removeUserRoleAction}>
                      <input type="hidden" name="userId" value={userId} />
                      <input type="hidden" name="role" value={role} />
                      <button
                        type="submit"
                        aria-label={`Remove ${role} role`}
                        className="ml-0.5 text-muted hover:text-danger"
                      >
                        ×
                      </button>
                    </form>
                  ) : null}
                </span>
              );
            })}
        </div>
      ) : (
        <p className="text-[11px] text-muted">Customer only</p>
      )}
    </div>
  );
}

export function RemoveRoleButton({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: UserRole;
  disabled?: boolean;
}) {
  if (disabled) return null;
  return (
    <form action={removeUserRoleAction}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="role" value={role} />
      <button
        type="submit"
        className="text-xs text-muted underline-offset-2 hover:text-danger hover:underline"
      >
        Remove
      </button>
    </form>
  );
}
