import Link from "next/link";
import { Building2, Hospital, ScrollText, ShieldCheck, UserCog, Users } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminPage } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireAdminPage();
  const admin = createAdminClient();

  const [profiles, orgs, facilities, logs] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("organizations").select("id", { count: "exact", head: true }),
    admin.from("facilities").select("id", { count: "exact", head: true }),
    admin.from("audit_logs").select("id", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Users & Staff", value: profiles.count ?? 0, href: "/admin/users", icon: UserCog },
    { label: "Organizations", value: orgs.count ?? 0, href: "/admin/organizations", icon: Building2 },
    { label: "Facilities", value: facilities.count ?? 0, href: "/admin/facilities", icon: Hospital },
    { label: "Audit Events", value: logs.count ?? 0, href: "/admin/audit-logs", icon: ScrollText },
  ];

  return (
    <>
      <div className="pagehead">
        <div>
          <h2>Super Admin</h2>
          <div className="muted">Manage users, organizations, facilities, roles and system activity.</div>
        </div>
        <span className="badge blue">{session.role.replaceAll("_", " ")}</span>
      </div>

      <div className="hero">
        <h1>Administration Center</h1>
        <p className="muted" style={{ margin: 0 }}>
          Central control for the EHR Portal. Changes here affect the organization and resident workspace.
        </p>
      </div>

      <div className="stats adminStats">
        {cards.map(({ label, value, href, icon: Icon }) => (
          <Link href={href} className="card stat adminStat" key={href}>
            <div className="adminIcon"><Icon size={20} /></div>
            <span className="muted">{label}</span>
            <b>{value}</b>
            <small>Open management</small>
          </Link>
        ))}
      </div>

      <div className="grid grid3" style={{ marginTop: 16 }}>
        <Link href="/admin/users" className="card adminQuick"><UserCog /><div><b>User Management</b><p>Invite users, change roles and activate/deactivate access.</p></div></Link>
        <Link href="/admin/roles" className="card adminQuick"><Users /><div><b>Roles & Permissions</b><p>Review access levels used throughout the portal.</p></div></Link>
        <Link href="/settings" className="card adminQuick"><ShieldCheck /><div><b>System Settings</b><p>Organization, facility and security configuration.</p></div></Link>
      </div>
    </>
  );
}
