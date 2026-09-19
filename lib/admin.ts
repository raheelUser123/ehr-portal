import { redirect } from "next/navigation";
import { getSession, hasCapability } from "@/lib/auth";
import type { Capability } from "@/lib/capabilities";

export function isAdminRole(role?: string | null) {
  const value = (role || "").toUpperCase();
  return value === "SUPER_ADMIN" || value === "ADMIN";
}

export async function requireAdminPage(capability: Capability = "admin.dashboard") {
  const session = await getSession();
  if (!session) return redirect("/login");
  if (!hasCapability(session, capability)) return redirect("/dashboard?access=denied");
  return session;
}
