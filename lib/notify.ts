import { createAdminClient } from "@/lib/supabase/admin";

export async function notifyAll(title:string,message:string,type="info",href?:string){
  const admin=createAdminClient();
  const {data:profiles}=await admin.from("profiles").select("id").eq("active",true);
  if(!profiles?.length) return;
  await admin.from("notifications").insert(profiles.map(p=>({user_id:p.id,title,message,type,href:href||null})));
}
