"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Activity,
  HeartPulse,
  RefreshCcw,
  Pill,
  Bell,
  Settings,
  FileText,
  PlusSquare,
  ShieldCheck,
  Building2,
  Hospital,
  UserCog,
  ScrollText,
  Route,
  NotebookPen,
} from "lucide-react";

const residentItems = [
  ["/dashboard", "Home", LayoutDashboard],
  ["/therapy-progress-notes", "Therapy Progress Notes", NotebookPen],
  ["/mileage-log", "Mileage Log", Route],
  ["/residents", "Resident List", Users],
  ["/resident-chart", "Resident Chart", ClipboardList],
  ["/resident-vitals", "Resident Vitals", HeartPulse],
  ["/resident-tracking", "Resident Tracking", Activity],
  ["/re-assessment", "Re-Assessment", RefreshCcw],
  ["/medications", "Medications", Pill],
] as const;

const adminItems = [
  ["/admin", "Admin Dashboard", ShieldCheck],
  ["/admin/users", "Users & Staff", UserCog],
  ["/admin/organizations", "Organizations", Building2],
  ["/admin/facilities", "Facilities", Hospital],
  ["/admin/roles", "Roles & Permissions", Users],
  ["/admin/audit-logs", "Audit Logs", ScrollText],
] as const;

function isAdminRole(role?: string) {
  const value = (role || "").toUpperCase();
  return value === "SUPER_ADMIN" || value === "ADMIN";
}

export default function Sidebar({ role }: { role?: string }) {
  const path = usePathname();
  const admin = isAdminRole(role);

  const item = (href: string, label: string, Icon: any) => (
    <Link
      key={href}
      className={`navitem ${path === href || path.startsWith(href + "/") ? "active" : ""}`}
      href={href}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandmark">+</div>
        <div>
          <h1>EHR PORTAL</h1>
          <small>Behavioral Health Management</small>
        </div>
      </div>

      <div className="navgroup">Resident Workspace</div>
      {residentItems.map(([href, label, Icon]) => item(href, label, Icon))}

      <div className="navgroup">System</div>
      {item("/form-builder", "Create Form", PlusSquare)}
      {item("/notifications", "Notifications", Bell)}
      {item("/settings", "Settings", Settings)}

      {admin && (
        <>
          <div className="navgroup">Administration</div>
          {adminItems.map(([href, label, Icon]) => item(href, label, Icon))}
        </>
      )}

      <div
        style={{
          marginTop: 28,
          padding: "14px 12px",
          borderTop: "1px solid #ffffff20",
          fontSize: 11,
          color: "#bfe1e6",
        }}
      >
        <FileText size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
        Resident module v1.2
      </div>
    </aside>
  );
}
