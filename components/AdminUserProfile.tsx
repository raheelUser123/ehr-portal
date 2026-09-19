"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  active: boolean | null;
  organization_id: string | null;
  facility_id: string | null;
  created_at: string | null;
};

type Employee = {
  employee_number?: string | null;
  department?: string | null;
  employment_status?: string | null;
  hire_date?: string | null;
  job_title?: string | null;
};

type Props = {
  profile: Profile;
  email: string | null;
  authCreatedAt: string | null;
  lastSignInAt: string | null;
  organizationName: string | null;
  facilityName: string | null;
  employee: Employee | null;
  stats: {
    appointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
    formRecords: number;
    therapyNotes: number;
    mileageLogs: number;
    medicationAdministrations: number;
    employeeRecords: number;
    employeeDrafts: number;
    auditEvents: number;
  };
  appointments: any[];
  forms: any[];
  therapyNotes: any[];
  employeeRecords: any[];
  auditLogs: any[];
  currentRole: string;
};

const tabs = ["Overview", "Appointments", "Forms & Notes", "Employee / HR", "Audit Activity"] as const;

export default function AdminUserProfile(props: Props) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [profile, setProfile] = useState(props.profile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: props.profile.full_name || "",
    phone: props.profile.phone || "",
  });
  const [message, setMessage] = useState("");

  const initials = useMemo(() => {
    const p = (profile.full_name || props.email || "User").trim().split(/\s+/);
    return (p[0]?.[0] || "U") + (p[1]?.[0] || "");
  }, [profile.full_name, props.email]);

  async function saveBasic() {
    setMessage("");
    const res = await fetch(`/api/admin/users/${profile.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) return setMessage(json.error || "Unable to update profile.");
    setProfile((old) => ({ ...old, full_name: json.full_name, phone: json.phone }));
    setEditing(false);
    setMessage("Profile updated successfully.");
  }

  return (
    <>
      <div className="pagehead">
        <div>
          <div className="muted" style={{ marginBottom: 6 }}>
            <Link href="/admin/users" style={{ textDecoration: "none" }}>Users & Staff</Link> / Profile
          </div>
          <h2>Staff Profile</h2>
          <div className="muted">Complete account, activity and HR overview.</div>
        </div>
        <div className="actions">
          <Link href="/admin/users" className="btn btn-ghost">Back to Users</Link>
          <button className="btn btn-primary" onClick={() => setEditing((v) => !v)}>{editing ? "Cancel Edit" : "Edit Details"}</button>
        </div>
      </div>

      {message && <div className="toast" style={{ marginBottom: 14 }}>{message}</div>}

      <div className="card section staffProfileHero">
        <div className="staffProfileIdentity">
          <div className="staffAvatar">{initials.toUpperCase()}</div>
          <div>
            <h2 style={{ margin: 0 }}>{profile.full_name || "Unnamed User"}</h2>
            <div className="muted">{props.email || "No email available"}</div>
            <div className="actions" style={{ marginTop: 10 }}>
              <span className="badge blue">{(profile.role || "STAFF").replaceAll("_", " ")}</span>
              <span className={`badge ${profile.active ? "green" : "gray"}`}>{profile.active ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </div>
        <div className="staffProfileMeta">
          <div><span>Organization</span><b>{props.organizationName || "None"}</b></div>
          <div><span>Facility</span><b>{props.facilityName || "None"}</b></div>
          <div><span>Job Title</span><b>{props.employee?.job_title || "—"}</b></div>
          <div><span>Hire Date</span><b>{props.employee?.hire_date || "—"}</b></div>
        </div>
      </div>

      {editing && (
        <div className="card section" style={{ marginBottom: 16 }}>
          <h3>Edit Profile Details</h3>
          <div className="formgrid">
            <div className="field"><label>Full Name</label><input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="field"><label>Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="field"><label>Email</label><input className="input" value={props.email || ""} disabled /></div>
            <div className="field"><label>Role</label><input className="input" value={profile.role || "STAFF"} disabled /></div>
          </div>
          <div className="actions" style={{ marginTop: 16, justifyContent: "flex-end" }}>
            <button className="btn btn-primary" onClick={saveBasic}>Save Changes</button>
          </div>
        </div>
      )}

      <div className="staffStatsGrid">
        <div className="card staffStat"><span>Appointments Booked</span><b>{props.stats.appointments}</b><small>{props.stats.upcomingAppointments} upcoming · {props.stats.completedAppointments} completed</small></div>
        <div className="card staffStat"><span>Clinical Forms</span><b>{props.stats.formRecords}</b><small>Resident chart submissions</small></div>
        <div className="card staffStat"><span>Therapy Notes</span><b>{props.stats.therapyNotes}</b><small>Created by this user</small></div>
        <div className="card staffStat"><span>Medication Activity</span><b>{props.stats.medicationAdministrations}</b><small>Administration entries</small></div>
        <div className="card staffStat"><span>Employee / HR Records</span><b>{props.stats.employeeRecords}</b><small>{props.stats.employeeDrafts} drafts</small></div>
        <div className="card staffStat"><span>Audit Events</span><b>{props.stats.auditEvents}</b><small>Recorded portal actions</small></div>
      </div>

      <div className="card staffTabs">
        {tabs.map((x) => <button key={x} className={tab === x ? "active" : ""} onClick={() => setTab(x)}>{x}</button>)}
      </div>

      {tab === "Overview" && (
        <div className="staffProfileColumns">
          <div className="card section">
            <h3>Account Details</h3>
            <div className="staffDetailList">
              <div><span>Full Name</span><b>{profile.full_name || "—"}</b></div>
              <div><span>Email</span><b>{props.email || "—"}</b></div>
              <div><span>Phone</span><b>{profile.phone || "—"}</b></div>
              <div><span>Role</span><b>{profile.role || "—"}</b></div>
              <div><span>Status</span><b>{profile.active ? "Active" : "Inactive"}</b></div>
              <div><span>Last Sign In</span><b>{props.lastSignInAt ? new Date(props.lastSignInAt).toLocaleString() : "—"}</b></div>
              <div><span>Portal Account Created</span><b>{props.authCreatedAt ? new Date(props.authCreatedAt).toLocaleDateString() : "—"}</b></div>
            </div>
          </div>
          <div className="card section">
            <h3>Employment Details</h3>
            <div className="staffDetailList">
              <div><span>Employee Number</span><b>{props.employee?.employee_number || "—"}</b></div>
              <div><span>Job Title</span><b>{props.employee?.job_title || "—"}</b></div>
              <div><span>Department</span><b>{props.employee?.department || "—"}</b></div>
              <div><span>Employment Status</span><b>{props.employee?.employment_status || "—"}</b></div>
              <div><span>Hire Date</span><b>{props.employee?.hire_date || "—"}</b></div>
              <div><span>Organization</span><b>{props.organizationName || "—"}</b></div>
              <div><span>Facility</span><b>{props.facilityName || "—"}</b></div>
            </div>
          </div>
        </div>
      )}

      {tab === "Appointments" && (
        <div className="card section"><h3>Appointments Booked by User</h3><div className="tablewrap"><table className="table"><thead><tr><th>Date</th><th>Resident</th><th>Type</th><th>Status</th><th>Provider</th></tr></thead><tbody>{props.appointments.map((a) => <tr key={a.id}><td>{a.appointment_date || "—"} {a.start_time ? `· ${String(a.start_time).slice(0,5)}` : ""}</td><td>{[a.residents?.first_name, a.residents?.last_name].filter(Boolean).join(" ") || "Resident"}</td><td>{a.appointment_type || "—"}</td><td><span className="badge gray">{a.status || "—"}</span></td><td>{a.provider_name || "—"}</td></tr>)}</tbody></table>{!props.appointments.length && <div className="empty">No appointments booked by this user.</div>}</div></div>
      )}

      {tab === "Forms & Notes" && (
        <div className="staffProfileColumns">
          <div className="card section"><h3>Resident Chart Forms</h3><div className="tablewrap"><table className="table"><thead><tr><th>Form</th><th>Status</th><th>Date</th></tr></thead><tbody>{props.forms.map((f) => <tr key={f.id}><td>{f.form_title || f.form_slug || "Form"}</td><td><span className="badge gray">{f.status || "—"}</span></td><td>{f.created_at ? new Date(f.created_at).toLocaleDateString() : "—"}</td></tr>)}</tbody></table>{!props.forms.length && <div className="empty">No resident chart forms created by this user.</div>}</div></div>
          <div className="card section"><h3>Therapy Progress Notes</h3><div className="tablewrap"><table className="table"><thead><tr><th>Date</th><th>Topic</th><th>Status</th></tr></thead><tbody>{props.therapyNotes.map((n) => <tr key={n.id}><td>{n.note_date || "—"}</td><td>{n.topic || "—"}</td><td><span className="badge gray">{n.status || "—"}</span></td></tr>)}</tbody></table>{!props.therapyNotes.length && <div className="empty">No therapy progress notes created by this user.</div>}</div></div>
        </div>
      )}

      {tab === "Employee / HR" && (
        <div className="card section"><div className="pagehead"><div><h3>Employee / HR Records</h3><div className="muted">Documents, training, time off, schedules and HR forms.</div></div><Link className="btn btn-primary" href="/employee/information">Open Employee Workspace</Link></div><div className="tablewrap"><table className="table"><thead><tr><th>Module</th><th>Title</th><th>Status</th><th>Updated</th></tr></thead><tbody>{props.employeeRecords.map((r) => <tr key={r.id}><td>{String(r.module || "").replaceAll("-", " ")}</td><td>{r.title || "—"}</td><td><span className={`badge ${r.status === "submitted" ? "green" : "gray"}`}>{r.status || "draft"}</span></td><td>{r.updated_at ? new Date(r.updated_at).toLocaleDateString() : "—"}</td></tr>)}</tbody></table>{!props.employeeRecords.length && <div className="empty">No HR records found for this user.</div>}</div></div>
      )}

      {tab === "Audit Activity" && (
        <div className="card section"><h3>Recent Audit Activity</h3><div className="tablewrap"><table className="table"><thead><tr><th>Date</th><th>Action</th><th>Entity</th><th>Details</th></tr></thead><tbody>{props.auditLogs.map((x) => <tr key={x.id}><td>{new Date(x.created_at).toLocaleString()}</td><td><span className="badge gray">{x.action || "—"}</span></td><td>{x.entity_type || "—"}</td><td><code style={{ fontSize: 11 }}>{JSON.stringify(x.metadata || {})}</code></td></tr>)}</tbody></table>{!props.auditLogs.length && <div className="empty">No audit activity recorded for this user.</div>}</div></div>
      )}
    </>
  );
}
