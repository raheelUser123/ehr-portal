import Link from "next/link";
import { Bell, Building2, Hospital, ScrollText, ShieldCheck, UserCog, Users } from "lucide-react";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/admin";

export default async function SettingsPage() {
  const session = await getSession();
  const admin = isAdminRole(session?.role);

  const items = [
    { title: "Organization", text: "Manage company-level information and organization records.", href: "/admin/organizations", icon: Building2, admin: true },
    { title: "Facilities", text: "Manage facility names, addresses and organization assignment.", href: "/admin/facilities", icon: Hospital, admin: true },
    { title: "Users & Staff", text: "Invite portal users, assign roles and control active access.", href: "/admin/users", icon: UserCog, admin: true },
    { title: "Roles & Permissions", text: "Review Super Admin, Admin and clinical staff access levels.", href: "/admin/roles", icon: Users, admin: true },
    { title: "Notifications", text: "Review your system alerts and unread documentation notifications.", href: "/notifications", icon: Bell, admin: false },
    { title: "Audit Logs", text: "Review system actions and important administrative changes.", href: "/admin/audit-logs", icon: ScrollText, admin: true },
  ].filter((x) => !x.admin || admin);

  return (
    <>
      <div className="pagehead">
        <div>
          <h2>Settings</h2>
          <div className="muted">Portal configuration, access and system administration.</div>
        </div>
        {admin && <Link className="btn btn-primary" href="/admin"><ShieldCheck size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />Admin Center</Link>}
      </div>

      <div className="grid grid3 settingsGrid">
        {items.map(({ title, text, href, icon: Icon }) => (
          <Link href={href} className="card settingsCard" key={href}>
            <div className="settingsIcon"><Icon size={22} /></div>
            <h3>{title}</h3>
            <p>{text}</p>
            <span>Open →</span>
          </Link>
        ))}
      </div>
    </>
  );
}
