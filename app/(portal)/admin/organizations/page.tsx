import { requireAdminPage } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import SimpleAdminCrud from "@/components/SimpleAdminCrud";

export const dynamic = "force-dynamic";
export default async function OrganizationsPage(){await requireAdminPage("admin.organizations");const admin=createAdminClient();const {data}=await admin.from("organizations").select("id,name,created_at").order("created_at",{ascending:false});return <SimpleAdminCrud title="Organizations" subtitle="Create and manage organizations in the EHR Portal." endpoint="/api/admin/organizations" rows={data||[]} fields={[{key:"name",label:"Organization Name",required:true}]}/>}
