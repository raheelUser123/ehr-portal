import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession, hasCapability } from "@/lib/auth";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !hasCapability(session,"admin.users")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params; const body = await request.json(); const admin=createAdminClient();
  const {data:target}=await admin.from("profiles").select("role").eq("id",id).maybeSingle();
  if(String(target?.role||"").toUpperCase()==="SUPER_ADMIN"&&session.role!=="SUPER_ADMIN") return NextResponse.json({error:"Only Super Admin can modify a Super Admin account."},{status:403});
  if(body.role&&String(body.role).toUpperCase()==="SUPER_ADMIN"&&session.role!=="SUPER_ADMIN") return NextResponse.json({error:"Only Super Admin can assign the Super Admin role."},{status:403});
  const allowed: any = {}; for (const key of ["role", "active", "organization_id", "facility_id", "full_name", "phone"]) if (key in body) allowed[key] = body[key]; if (allowed.role) allowed.role = String(allowed.role).toUpperCase();
  const { data, error } = await admin.from("profiles").update(allowed).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await admin.from("audit_logs").insert({ organization_id: data.organization_id, actor_id: session.id, entity_type: "profile", entity_id: id, action: "UPDATE_USER", metadata: allowed });
  return NextResponse.json(data);
}
