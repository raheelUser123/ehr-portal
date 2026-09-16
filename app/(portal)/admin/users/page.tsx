import { requireAdminPage } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import UsersManager from "@/components/UsersManager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdminPage();
  const admin = createAdminClient();
  const [{ data: profiles }, { data: organizations }, { data: facilities }] = await Promise.all([
    admin.from("profiles").select("id,full_name,role,phone,active,organization_id,facility_id,created_at").order("created_at", { ascending: false }),
    admin.from("organizations").select("id,name").order("name"),
    admin.from("facilities").select("id,name,organization_id").order("name"),
  ]);

  return <UsersManager initialUsers={profiles || []} organizations={organizations || []} facilities={facilities || []} />;
}
