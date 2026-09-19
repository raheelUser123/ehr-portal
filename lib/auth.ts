import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_CAPABILITIES, DEFAULT_ROLE_CAPABILITIES, type Capability } from "@/lib/capabilities";

export type SessionUser = { id: string; email: string; name: string; role: string; capabilities: Capability[] };

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, role, active")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.active === false) return null;

  const role = String(profile?.role || "STAFF").trim().toUpperCase().replace(/[\s-]+/g, "_");
  let capabilities: Capability[] = role === "SUPER_ADMIN" ? ALL_CAPABILITIES : (DEFAULT_ROLE_CAPABILITIES[role] || DEFAULT_ROLE_CAPABILITIES.STAFF);

  if (role !== "SUPER_ADMIN") {
    const { data: rows } = await admin.from("role_permissions").select("capability,allowed").eq("role", role);
    if (rows && rows.length) capabilities = rows.filter((r:any)=>r.allowed).map((r:any)=>r.capability as Capability);
  }

  return {
    id: user.id,
    email: user.email || "",
    name: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
    role,
    capabilities,
  };
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}

export async function requireCapability(capability: Capability) {
  const session = await requireSession();
  if (session.role !== "SUPER_ADMIN" && !session.capabilities.includes(capability)) throw new Error("FORBIDDEN");
  return session;
}

export function hasCapability(session: SessionUser | null | undefined, capability: Capability) {
  return !!session && (session.role === "SUPER_ADMIN" || session.capabilities.includes(capability));
}
