import { requireAdminPage } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import FacilitiesManager from "@/components/FacilitiesManager";
export const dynamic="force-dynamic";
export default async function FacilitiesPage(){await requireAdminPage("admin.facilities");const a=createAdminClient();const [{data:facilities},{data:organizations}]=await Promise.all([a.from("facilities").select("id,name,address,organization_id,created_at").order("created_at",{ascending:false}),a.from("organizations").select("id,name").order("name")]);return <FacilitiesManager initialFacilities={facilities||[]} organizations={organizations||[]}/>}
