import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {requireCapability} from "@/lib/auth";
export async function GET(){await requireCapability("residents.view");const db=createAdminClient();const {data,error}=await db.from("facilities").select("id,name,address,organization_id").order("name");if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json(data||[])}
