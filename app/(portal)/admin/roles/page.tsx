import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DEFAULT_ROLE_CAPABILITIES } from "@/lib/capabilities";
import RoleCapabilitiesManager from "@/components/RoleCapabilitiesManager";

export default async function RolesPage(){
 const session=await getSession(); if(!session)return redirect("/login"); if(session.role!=="SUPER_ADMIN")redirect("/admin");
 const db=createAdminClient(); const {data}=await db.from("role_permissions").select("role,capability,allowed");
 const initial:Record<string,string[]>={}; for(const [role,caps] of Object.entries(DEFAULT_ROLE_CAPABILITIES)) initial[role]=[...caps];
 const grouped=new Map<string,any[]>(); (data||[]).forEach((r:any)=>{const arr=grouped.get(r.role)||[];arr.push(r);grouped.set(r.role,arr)});
 for(const [role,rows] of grouped) initial[role]=rows.filter((r:any)=>r.allowed).map((r:any)=>r.capability);
 return <><div className="pagehead"><div><h2>Roles & Permissions</h2><div className="muted">Configure menu visibility and create/edit/delete capabilities for staff roles.</div></div></div><RoleCapabilitiesManager initial={initial}/></>
}
