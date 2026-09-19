"use client";

import { useMemo, useState } from "react";

type Props = {
  profile: any;
  email: string;
  lastSignInAt: string | null;
  organizationName: string | null;
  facilityName: string | null;
  employee: any;
};

export default function MyProfileForm({ profile, email, lastSignInAt, organizationName, facilityName, employee }: Props) {
  const [name, setName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const initials = useMemo(() => (name || email || "User").split(/\s+/).map((x:string)=>x[0]).slice(0,2).join("").toUpperCase(), [name, email]);

  async function save() {
    setSaving(true); setMessage("");
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ full_name: name, phone }) });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) return setMessage(json.error || "Unable to update profile.");
    setEditing(false); setMessage("Profile updated successfully.");
  }

  return <div className="staffProfileColumns">
    <div className="card section">
      <div className="staffProfileHero">
        <div className="staffAvatarLarge">{initials}</div>
        <div>
          <h2 style={{marginBottom:4}}>{name || "User"}</h2>
          <div className="muted">{email}</div>
          <div style={{marginTop:10,display:"flex",gap:8,flexWrap:"wrap"}}>
            <span className="badge blue">{String(profile.role || "STAFF").replaceAll("_"," ")}</span>
            <span className={`badge ${profile.active === false ? "gray" : "green"}`}>{profile.active === false ? "Inactive" : "Active"}</span>
          </div>
        </div>
      </div>
      {message && <div className="toast" style={{marginTop:14}}>{message}</div>}
      <div style={{marginTop:18}}>
        {!editing ? <button className="btn btn-primary" onClick={()=>setEditing(true)}>Edit My Details</button> : <div className="formgrid">
          <div className="field"><label>Full Name</label><input className="input" value={name} onChange={e=>setName(e.target.value)} /></div>
          <div className="field"><label>Phone</label><input className="input" value={phone} onChange={e=>setPhone(e.target.value)} /></div>
          <div className="actions full"><button className="btn btn-primary" disabled={saving} onClick={save}>{saving?"Saving...":"Save Changes"}</button><button className="btn btn-ghost" onClick={()=>setEditing(false)}>Cancel</button></div>
        </div>}
      </div>
    </div>

    <div className="card section">
      <h3>Account & Employment</h3>
      <div className="staffDetailList">
        <div><span>Email</span><b>{email || "—"}</b></div>
        <div><span>Phone</span><b>{phone || "—"}</b></div>
        <div><span>Organization</span><b>{organizationName || "—"}</b></div>
        <div><span>Facility</span><b>{facilityName || "—"}</b></div>
        <div><span>Employee Number</span><b>{employee?.employee_number || "—"}</b></div>
        <div><span>Job Title</span><b>{employee?.job_title || "—"}</b></div>
        <div><span>Department</span><b>{employee?.department || "—"}</b></div>
        <div><span>Employment Status</span><b>{employee?.employment_status || "—"}</b></div>
        <div><span>Hire Date</span><b>{employee?.hire_date || "—"}</b></div>
        <div><span>Last Sign In</span><b>{lastSignInAt ? new Date(lastSignInAt).toLocaleString() : "—"}</b></div>
      </div>
    </div>
  </div>;
}
