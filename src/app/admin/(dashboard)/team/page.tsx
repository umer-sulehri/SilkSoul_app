import type { Metadata } from "next";
import { ShieldCheck, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TeamRoleForm } from "@/components/admin/team-role-form";
import { EmptyState } from "@/components/ui/layout";
import { requireAdmin } from "@/lib/auth/admin";
import { listTeam } from "@/lib/data/admin";
import { formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Team access" };

export default async function AdminTeamPage() {
  const context = await requireAdmin();
  const team = await listTeam();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Access"
        title="Team access"
        description="Grant staff or administrator access. RLS enforces these roles on every request."
      />

      <div className="flex items-start gap-3 rounded-[14px] border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-muted">
          Create the account in Supabase Authentication first. The profile appears here
          automatically. Administrators can manage products, settings and team access; staff can
          manage catalog, inventory and orders.
        </p>
      </div>

      {team.length === 0 ? (
        <EmptyState
          title="No profiles yet"
          description="Create a user in Supabase Authentication, then refresh this page."
          icon={<Users className="h-7 w-7" aria-hidden="true" />}
        />
      ) : (
        <ul className="space-y-3">
          {team.map((member) => {
            const isSelf = member.profile.id === context.user?.id;
            const name = member.profile.full_name || member.profile.email || "Unnamed user";
            const hasAccess = member.roles.some(
              (role) => role === "admin" || role === "staff",
            );
            return (
              <li
                key={member.profile.id}
                className="rounded-[16px] border border-border bg-surface p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {initials(name) || "SS"}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-ink">{name}</p>
                        {isSelf ? (
                          <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[11px] text-muted">
                            You
                          </span>
                        ) : null}
                        {!hasAccess ? (
                          <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[11px] text-muted">
                            Customer
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-muted">
                        {member.profile.email ?? "No email on profile"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        Joined {formatDate(member.profile.created_at)} · ID{" "}
                        <span className="font-mono">{member.profile.id.slice(0, 8)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="sm:w-[300px]">
                    <TeamRoleForm
                      userId={member.profile.id}
                      roles={member.roles}
                      isSelf={isSelf}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
