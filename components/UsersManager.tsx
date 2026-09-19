"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const ALL_ROLES = ["SUPER_ADMIN", "ADMIN", "BHP", "BHT", "NURSE", "THERAPIST", "CASE_MANAGER", "PROVIDER", "STAFF"];

type UserRow = {
  id: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  active: boolean;
  organization_id: string | null;
  facility_id: string | null;
  created_at: string;
};

export default function UsersManager({ initialUsers, organizations, facilities, currentRole }: any) {
  const ROLES = currentRole === "SUPER_ADMIN" ? ALL_ROLES : ALL_ROLES.filter(r=>r!=="SUPER_ADMIN");
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "STAFF", organization_id: "", facility_id: "" });

  const rows = useMemo(() => users.filter((u) => `${u.full_name || ""} ${u.role}`.toLowerCase().includes(search.toLowerCase())), [users, search]);

  async function update(id: string, patch: any) {
    setMessage("");
    const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    const json = await res.json();
    if (!res.ok) return setMessage(json.error || "Unable to update user.");
    setUsers((old) => old.map((u) => (u.id === id ? { ...u, ...json } : u)));
    setMessage("User updated successfully.");
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault(); setMessage("");
    const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json = await res.json();
    if (!res.ok) return setMessage(json.error || "Unable to create user.");
    setUsers((old) => [json, ...old]);
    setCreating(false);
    setForm({ email: "", password: "", full_name: "", role: "STAFF", organization_id: "", facility_id: "" });
    setMessage("User created successfully.");
  }

  return <>
    <div className="pagehead"><div><h2>Users & Staff</h2><div className="muted">Create users, assign roles and control portal access.</div></div><button className="btn btn-primary" onClick={() => setCreating(!creating)}>+ Add User</button></div>
    {message && <div className="toast" style={{marginBottom:14}}>{message}</div>}
    {creating && <form className="card section" onSubmit={createUser} style={{marginBottom:16}}><h3>Create Portal User</h3><div className="formgrid">
      <div className="field"><label>Full Name</label><input className="input" required value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/></div>
      <div className="field"><label>Email</label><input className="input" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
      <div className="field"><label>Temporary Password</label><input className="input" type="password" minLength={8} required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
      <div className="field"><label>Role</label><select className="select" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
      <div className="field"><label>Organization</label><select className="select" value={form.organization_id} onChange={e=>setForm({...form,organization_id:e.target.value,facility_id:""})}><option value="">None</option>{organizations.map((o:any)=><option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
      <div className="field"><label>Facility</label><select className="select" value={form.facility_id} onChange={e=>setForm({...form,facility_id:e.target.value})}><option value="">None</option>{facilities.filter((f:any)=>!form.organization_id||f.organization_id===form.organization_id).map((f:any)=><option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
    </div><div className="actions" style={{marginTop:16}}><button className="btn btn-primary">Create User</button><button type="button" className="btn btn-ghost" onClick={()=>setCreating(false)}>Cancel</button></div></form>}
    <div className="card section"><div className="toolbar" style={{marginBottom:14}}><input className="input" style={{maxWidth:380}} placeholder="Search users or roles..." value={search} onChange={e=>setSearch(e.target.value)}/><span className="muted">{rows.length} users</span></div><div className="tablewrap"><table className="table"><thead><tr><th>User</th><th>Role</th><th>Organization</th><th>Facility</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map(u=><tr key={u.id}><td><Link href={`/admin/users/${u.id}`} style={{textDecoration:"none",color:"inherit"}}><b>{u.full_name||"Unnamed User"}</b></Link><div className="muted" style={{fontSize:11}}>{u.id.slice(0,8)}…</div></td><td>{currentRole!=="SUPER_ADMIN" && (u.role||"").toUpperCase()==="SUPER_ADMIN" ? <span className="badge blue">SUPER ADMIN</span> : <select className="select compactSelect" value={(u.role||"STAFF").toUpperCase()} onChange={e=>update(u.id,{role:e.target.value})}>{ROLES.map(r=><option key={r}>{r}</option>)}</select>}</td><td><select className="select compactSelect" value={u.organization_id||""} onChange={e=>update(u.id,{organization_id:e.target.value||null,facility_id:null})}><option value="">None</option>{organizations.map((o:any)=><option key={o.id} value={o.id}>{o.name}</option>)}</select></td><td><select className="select compactSelect" value={u.facility_id||""} onChange={e=>update(u.id,{facility_id:e.target.value||null})}><option value="">None</option>{facilities.filter((f:any)=>!u.organization_id||f.organization_id===u.organization_id).map((f:any)=><option key={f.id} value={f.id}>{f.name}</option>)}</select></td><td><span className={`badge ${u.active?"green":"gray"}`}>{u.active?"Active":"Inactive"}</span></td><td><div className="actions"><Link className="btn btn-ghost compactBtn" href={`/admin/users/${u.id}`}>View Profile</Link>{currentRole!=="SUPER_ADMIN" && (u.role||"").toUpperCase()==="SUPER_ADMIN" ? <span className="muted">Protected</span> : <button className={`btn ${u.active?"btn-danger":"btn-soft"}`} onClick={()=>update(u.id,{active:!u.active})}>{u.active?"Deactivate":"Activate"}</button>}</div></td></tr>)}</tbody></table></div></div>
  </>;
}
