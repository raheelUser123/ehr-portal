import { requireAdminPage } from "@/lib/admin";
const roles=[
['SUPER_ADMIN','Full platform access','Organizations, facilities, users, settings, audit logs, all resident records'],
['ADMIN','Organization administration','Users, facilities, resident records, forms, reports'],
['BHP','Behavioral health professional','Clinical assessments, treatment plans, progress notes, signatures'],
['BHT','Behavioral health technician','Shift notes, ADLs, tracking and assigned documentation'],
['NURSE','Nursing access','Nursing assessment, vitals, medication-related records'],
['THERAPIST','Therapy access','Therapy and BHP progress documentation'],
['CASE_MANAGER','Case management','Resident coordination, meetings, contacts and discharge planning'],
['PROVIDER','Provider access','Clinical review, diagnoses, medication and treatment documentation'],
['STAFF','Basic staff access','Resident workspace according to assigned workflows'],
];
export default async function RolesPage(){await requireAdminPage();return <><div className="pagehead"><div><h2>Roles & Permissions</h2><div className="muted">Role catalog used by the EHR Portal.</div></div></div><div className="card section"><div className="tablewrap"><table className="table"><thead><tr><th>Role</th><th>Purpose</th><th>Default Access</th></tr></thead><tbody>{roles.map(r=><tr key={r[0]}><td><span className="badge blue">{r[0]}</span></td><td><b>{r[1]}</b></td><td>{r[2]}</td></tr>)}</tbody></table></div></div><div className="card section" style={{marginTop:16}}><h3>Permission model</h3><p className="muted" style={{margin:0}}>Role assignment is managed from <b>Users & Staff</b>. The current resident module uses role-based admin visibility; module-specific create/edit/sign/approve permissions can be expanded when Employee and Medication workspaces are added.</p></div></>}
