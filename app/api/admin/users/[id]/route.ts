import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { isAdminRole } from "@/lib/admin";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json();
  const allowed: any = {};
  for (const key of ["role", "active", "organization_id", "facility_id", "full_name", "phone"]) if (key in body) allowed[key] = body[key];
  if (allowed.role) allowed.role = String(allowed.role).toUpperCase();

  const admin = createAdminClient();
  const { data, error } = await admin.from("profiles").update(allowed).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await admin.from("audit_logs").insert({ organization_id: data.organization_id, actor_id: session.id, entity_type: "profile", entity_id: id, action: "UPDATE_USER", metadata: allowed });
  return NextResponse.json(data);
}
