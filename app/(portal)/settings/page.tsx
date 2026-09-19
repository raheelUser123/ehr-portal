import Link from "next/link";
import { Bell, Building2, Hospital, ScrollText, ShieldCheck, UserCog, Users } from "lucide-react";
import { getSession, hasCapability } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await getSession();
  const items = [
    { title: "Organization", text: "Manage company-level information and organization records.", href: "/admin/organizations", icon: Building2, cap: "admin.organizations" as const },
    { title: "Facilities", text: "Manage facility names, addresses and organization assignment.", href: "/admin/facilities", icon: Hospital, cap: "admin.facilities" as const },
    { title: "Users & Staff", text: "Invite portal users, assign roles and control active access.", href: "/admin/users", icon: UserCog, cap: "admin.users" as const },
    { title: "Role Capabilities", text: "Set menu and create/edit/delete access for each staff role.", href: "/admin/roles", icon: Users, cap: "admin.roles" as const },
    { title: "Notifications", text: "Review your system alerts and unread documentation notifications.", href: "/notifications", icon: Bell, cap: "notifications.view" as const },
    { title: "Audit Logs", text: "Review system actions and important administrative changes.", href: "/admin/audit-logs", icon: ScrollText, cap: "admin.audit" as const },
  ].filter(x=>hasCapability(session,x.cap));
  const canAdmin=hasCapability(session,"admin.dashboard");
  return <><div className="pagehead"><div><h2>Settings</h2><div className="muted">Portal configuration, access and system administration.</div></div>{canAdmin&&<Link className="btn btn-primary" href="/admin"><ShieldCheck size={16} style={{verticalAlign:"middle",marginRight:6}}/>Admin Center</Link>}</div><div className="grid grid3 settingsGrid">{items.map(({title,text,href,icon:Icon})=><Link href={href} className="card settingsCard" key={href}><div className="settingsIcon"><Icon size={22}/></div><h3>{title}</h3><p>{text}</p><span>Open →</span></Link>)}</div></>;
}
