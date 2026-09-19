import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth";

export async function PATCH(request: Request) {
  const session = await requireSession();
  const body = await request.json();
  const fullName = String(body.full_name || "").trim();
  const phone = String(body.phone || "").trim();
  if (!fullName) return NextResponse.json({ error: "Full name is required." }, { status: 400 });
  const db = createAdminClient();
  const { data, error } = await db.from("profiles").update({ full_name: fullName, phone: phone || null }).eq("id", session.id).select("id,full_name,phone").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await db.from("audit_logs").insert({ actor_id: session.id, entity_type: "profile", entity_id: session.id, action: "UPDATE_OWN_PROFILE", metadata: { full_name: fullName } });
  return NextResponse.json(data);
}
