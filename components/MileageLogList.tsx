"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MileageLogList({canManage}:{canManage:boolean}) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("mileage_logs").select("*").order("log_date", { ascending: false }).order("created_at", { ascending: false });
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => `${r.resident_initials || ""} ${r.destination || ""} ${r.status || ""}`.toLowerCase().includes(search.toLowerCase()));

  const remove = async (id: string) => {
    if (!window.confirm("Delete this Mileage Log?")) return;
    const { error } = await supabase.from("mileage_logs").delete().eq("id", id);
    if (error) window.alert(error.message);
    else setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="ml-page">
      <div className="ml-titlebar">
        <Link href="/dashboard">← <span>Back</span></Link>
        <h1>Mileage Log</h1>
        {canManage && <Link className="ml-create" href="/mileage-log/new">+ Create New</Link>}
      </div>
      <div className="ml-toolbar"><input placeholder="Search initials, destination or status..." value={search} onChange={(e) => setSearch(e.target.value)} /><span>{filtered.length} records</span></div>
      <div className="ml-card">
        {loading ? <div className="ml-empty">Loading...</div> : filtered.length === 0 ? <div className="ml-empty"><strong>No Results Found</strong><span>Create a Mileage Log to get started.</span></div> :
        <div className="ml-table-wrap"><table className="ml-table"><thead><tr><th>Date</th><th>Resident Initials</th><th>Beginning</th><th>Ending</th><th>Total</th><th>Destination</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {filtered.map((r) => <tr key={r.id}><td>{r.log_date || "—"}</td><td><strong>{r.resident_initials || "—"}</strong></td><td>{r.beginning_mileage ?? "—"}</td><td>{r.ending_mileage ?? "—"}</td><td>{r.total_mileage ?? "—"}</td><td>{r.destination || "—"}</td><td><span className={`ml-status ${r.status === "submitted" ? "submitted" : "draft"}`}>{r.status || "draft"}</span></td><td><div className="ml-row-actions">{canManage ? <><Link href={`/mileage-log/${r.id}/edit`}>Edit</Link><button onClick={() => remove(r.id)}>Delete</button></> : <span className="muted">View only</span>}</div></td></tr>)}
        </tbody></table></div>}
      </div>
    </div>
  );
}
