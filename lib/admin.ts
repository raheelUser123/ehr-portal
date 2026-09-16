import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export function isAdminRole(role?: string | null) {
  const value = (role || "").toUpperCase();
  return value === "SUPER_ADMIN" || value === "ADMIN";
}

export async function requireAdminPage() {
  const session = await getSession();
  if (!session) return redirect("/login");
  if (!isAdminRole(session.role)) return redirect("/dashboard");
  return session;
}
