"use client";
import {useMemo,useState} from "react";
import {CAPABILITY_GROUPS, type Capability} from "@/lib/capabilities";

const ROLES=["SUPER_ADMIN","ADMIN","BHP","BHT","NURSE","THERAPIST","CASE_MANAGER","PROVIDER","STAFF"];
export default function RoleCapabilitiesManager({initial}:{initial:Record<string,string[]>}){
 const [role,setRole]=useState("ADMIN"); const [matrix,setMatrix]=useState(initial); const [saving,setSaving]=useState(false); const [msg,setMsg]=useState("");
 const current=useMemo(()=>new Set(matrix[role]||[]),[matrix,role]);
 const toggle=(cap:Capability)=>{if(role==="SUPER_ADMIN")return;const n=new Set(current);n.has(cap)?n.delete(cap):n.add(cap);setMatrix({...matrix,[role]:Array.from(n)})};
 async function save(){if(role==="SUPER_ADMIN")return;setSaving(true);setMsg("");const r=await fetch(`/api/admin/roles/${role}/permissions`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({capabilities:matrix[role]||[]})});const j=await r.json().catch(()=>({}));setSaving(false);setMsg(r.ok?"Capabilities saved successfully.":j.error||"Unable to save capabilities.")}
 return <div className="card section"><div className="pagehead"><div><h3>Role Capabilities</h3><div className="muted">Select exactly what each role can see and manage. Super Admin always has full access.</div></div><div className="actions"><select className="select" value={role} onChange={e=>setRole(e.target.value)}>{ROLES.map(r=><option key={r}>{r}</option>)}</select><button className="btn btn-primary" disabled={saving||role==="SUPER_ADMIN"} onClick={save}>{saving?"Saving...":"Save Capabilities"}</button></div></div>{msg&&<div className="toast" style={{marginBottom:14}}>{msg}</div>}<div className="capabilityGrid">{CAPABILITY_GROUPS.map(g=><section key={g.group} className="capabilityGroup"><h4>{g.group}</h4>{g.items.map(i=><label className="capabilityCheck" key={i.key}><input type="checkbox" checked={role==="SUPER_ADMIN"||current.has(i.key)} disabled={role==="SUPER_ADMIN"} onChange={()=>toggle(i.key)}/><span><b>{i.label}</b><small>{i.key}</small></span></label>)}</section>)}</div></div>
}
