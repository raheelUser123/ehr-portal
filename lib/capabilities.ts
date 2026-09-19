export type Capability =
  | "dashboard.view"
  | "residents.view" | "residents.create" | "residents.edit" | "residents.delete"
  | "appointments.view" | "appointments.manage"
  | "forms.view" | "forms.create" | "forms.edit" | "forms.delete" | "forms.sign"
  | "vitals.view" | "vitals.manage"
  | "tracking.view" | "tracking.manage"
  | "medications.view" | "medications.manage" | "medications.administer"
  | "therapy.view" | "therapy.manage"
  | "mileage.view" | "mileage.manage"
  | "employee.view" | "employee.manage"
  | "notifications.view"
  | "form_builder.manage"
  | "settings.view" | "settings.manage"
  | "admin.dashboard" | "admin.users" | "admin.organizations" | "admin.facilities" | "admin.roles" | "admin.audit";

export const CAPABILITY_GROUPS: { group: string; items: { key: Capability; label: string }[] }[] = [
  { group: "Dashboard", items: [
    { key: "dashboard.view", label: "View dashboard" },
  ]},
  { group: "Residents", items: [
    { key: "residents.view", label: "View residents" },
    { key: "residents.create", label: "Add residents" },
    { key: "residents.edit", label: "Edit residents" },
    { key: "residents.delete", label: "Delete residents" },
    { key: "appointments.view", label: "View appointments" },
    { key: "appointments.manage", label: "Book / edit / delete appointments" },
  ]},
  { group: "Clinical Forms", items: [
    { key: "forms.view", label: "View resident chart & form records" },
    { key: "forms.create", label: "Create form records" },
    { key: "forms.edit", label: "Edit form records" },
    { key: "forms.delete", label: "Delete form records" },
    { key: "forms.sign", label: "Sign submitted forms" },
    { key: "form_builder.manage", label: "Create / manage custom forms" },
  ]},
  { group: "Resident Care", items: [
    { key: "vitals.view", label: "View vitals" },
    { key: "vitals.manage", label: "Record / edit vitals" },
    { key: "tracking.view", label: "View resident tracking" },
    { key: "tracking.manage", label: "Update resident tracking" },
    { key: "therapy.view", label: "View therapy progress notes" },
    { key: "therapy.manage", label: "Create / edit therapy progress notes" },
    { key: "mileage.view", label: "View mileage log" },
    { key: "mileage.manage", label: "Create / edit mileage log" },
  ]},
  { group: "Medication", items: [
    { key: "medications.view", label: "View medication records" },
    { key: "medications.manage", label: "Create / edit medication records" },
    { key: "medications.administer", label: "Record medication administration (MAR)" },
  ]},
  { group: "Employees / HR", items: [
    { key: "employee.view", label: "View Employee workspace" },
    { key: "employee.manage", label: "Create / edit / delete Employee records" },
  ]},
  { group: "System", items: [
    { key: "notifications.view", label: "View notifications" },
    { key: "settings.view", label: "View settings" },
    { key: "settings.manage", label: "Manage settings" },
  ]},
  { group: "Administration", items: [
    { key: "admin.dashboard", label: "Admin dashboard" },
    { key: "admin.users", label: "Users & staff management" },
    { key: "admin.organizations", label: "Organizations" },
    { key: "admin.facilities", label: "Facilities" },
    { key: "admin.roles", label: "Role capabilities" },
    { key: "admin.audit", label: "Audit logs" },
  ]},
];

export const ALL_CAPABILITIES = CAPABILITY_GROUPS.flatMap(g => g.items.map(i => i.key));

export const DEFAULT_ROLE_CAPABILITIES: Record<string, Capability[]> = {
  SUPER_ADMIN: ALL_CAPABILITIES,
  ADMIN: ALL_CAPABILITIES.filter(k => k !== "admin.roles"),
  BHP: ["dashboard.view","residents.view","appointments.view","forms.view","forms.create","forms.edit","forms.sign","vitals.view","tracking.view","therapy.view","therapy.manage","medications.view","mileage.view","employee.view","notifications.view"],
  BHT: ["dashboard.view","residents.view","appointments.view","forms.view","forms.create","forms.edit","vitals.view","vitals.manage","tracking.view","tracking.manage","therapy.view","mileage.view","mileage.manage","medications.view","notifications.view"],
  NURSE: ["dashboard.view","residents.view","appointments.view","forms.view","forms.create","forms.edit","forms.sign","vitals.view","vitals.manage","tracking.view","tracking.manage","medications.view","medications.manage","medications.administer","notifications.view"],
  THERAPIST: ["dashboard.view","residents.view","appointments.view","forms.view","forms.create","forms.edit","forms.sign","therapy.view","therapy.manage","tracking.view","notifications.view"],
  CASE_MANAGER: ["dashboard.view","residents.view","appointments.view","appointments.manage","forms.view","forms.create","forms.edit","tracking.view","tracking.manage","therapy.view","medications.view","notifications.view"],
  PROVIDER: ["dashboard.view","residents.view","appointments.view","forms.view","forms.create","forms.edit","forms.sign","vitals.view","tracking.view","medications.view","medications.manage","medications.administer","therapy.view","notifications.view"],
  STAFF: ["dashboard.view","residents.view","appointments.view","forms.view","forms.create","forms.edit","vitals.view","tracking.view","medications.view","therapy.view","mileage.view","employee.view","notifications.view"],
};

export function capabilityForPath(pathname: string): Capability | null {
  if (pathname === "/dashboard" || pathname === "/") return "dashboard.view";
  if (pathname.startsWith("/appointments")) return "appointments.view";
  if (pathname.startsWith("/residents")) return "residents.view";
  if (/^\/resident-chart\/[^/]+\/records\/[^/]+$/.test(pathname)) return "forms.edit";
  if (pathname === "/resident-chart" || /\/resident-chart\/[^/]+\/records$/.test(pathname)) return "forms.view";
  if (pathname.startsWith("/resident-chart/")) return "forms.create";
  if (pathname.startsWith("/resident-vitals")) return "vitals.view";
  if (pathname.startsWith("/resident-tracking") || pathname.startsWith("/re-assessment")) return "tracking.view";
  if (pathname.startsWith("/medications")) return "medications.view";
  if (pathname.includes("/therapy-progress-notes/new") || pathname.includes("/therapy-progress-notes/") && pathname.endsWith("/edit")) return "therapy.manage";
  if (pathname.startsWith("/therapy-progress-notes")) return "therapy.view";
  if (pathname.includes("/mileage-log/new") || pathname.includes("/mileage-log/") && pathname.endsWith("/edit")) return "mileage.manage";
  if (pathname.startsWith("/mileage-log")) return "mileage.view";
  if (pathname.startsWith("/employee")) return "employee.view";
  if (pathname.startsWith("/form-builder")) return "form_builder.manage";
  if (pathname.startsWith("/notifications")) return "notifications.view";
  if (pathname.startsWith("/settings")) return "settings.view";
  if (pathname === "/admin") return "admin.dashboard";
  if (pathname.startsWith("/admin/users")) return "admin.users";
  if (pathname.startsWith("/admin/organizations")) return "admin.organizations";
  if (pathname.startsWith("/admin/facilities")) return "admin.facilities";
  if (pathname.startsWith("/admin/roles")) return "admin.roles";
  if (pathname.startsWith("/admin/audit-logs")) return "admin.audit";
  return null;
}
