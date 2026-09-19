import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession, hasCapability } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !hasCapability(session,"admin.users")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const requestedRole=String(body.role||"STAFF").toUpperCase();
  if(requestedRole==="SUPER_ADMIN"&&session.role!=="SUPER_ADMIN") return NextResponse.json({error:"Only Super Admin can create another Super Admin."},{status:403});
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({ email: body.email, password: body.password, email_confirm: true, user_metadata: { full_name: body.full_name } });
  if (error || !data.user) return NextResponse.json({ error: error?.message || "Unable to create user" }, { status: 400 });
  const row = { id: data.user.id, full_name: body.full_name, role: requestedRole, organization_id: body.organization_id || null, facility_id: body.facility_id || null, active: true };
  const { data: profile, error: profileError } = await admin.from("profiles").upsert(row).select("*").single();
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });
  await admin.from("audit_logs").insert({ organization_id: row.organization_id, actor_id: session.id, entity_type: "profile", entity_id: data.user.id, action: "CREATE_USER", metadata: { role: row.role } });
  return NextResponse.json(profile);
}
