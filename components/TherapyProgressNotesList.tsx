"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TherapyProgressNotesList({canManage}:{canManage:boolean}) {
  const supabase = useMemo(() => createClient(), []);
  const [notes, setNotes] = useState<any[]>([]);
  const [residents, setResidents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    const [{ data: noteData }, { data: residentData }] = await Promise.all([
      supabase
        .from("therapy_progress_notes")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("residents")
        .select("id,first_name,last_name,reference_id"),
    ]);

    setNotes(noteData || []);
    setResidents(residentData || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const residentName = (id: string) => {
    const resident = residents.find((r) => r.id === id);
    return resident
      ? [resident.first_name, resident.last_name].filter(Boolean).join(" ")
      : "Resident";
  };

  const filtered = notes.filter((note) => {
    const value = `${residentName(note.resident_id)} ${note.topic || ""} ${
      note.status || ""
    }`.toLowerCase();
    return value.includes(search.toLowerCase());
  });

  const remove = async (id: string) => {
    if (!window.confirm("Delete this Therapy Progress Note?")) return;

    const { error } = await supabase
      .from("therapy_progress_notes")
      .delete()
      .eq("id", id);

    if (!error) {
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } else {
      window.alert(error.message);
    }
  };

  return (
    <div className="tpn-page">
      <div className="tpn-titlebar">
        <Link className="tpn-back-link" href="/dashboard">
          ← <span>Back</span>
        </Link>
        <h1>Therapy Progress Notes</h1>
        {canManage && <Link href="/therapy-progress-notes/new" className="tpn-create">
          + Create New
        </Link>}
      </div>

      <div className="tpn-list-tools">
        <input
          type="search"
          placeholder="Search resident, topic or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span>{filtered.length} records</span>
      </div>

      <div className="tpn-list-card">
        {loading ? (
          <div className="tpn-empty">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="tpn-empty">
            <strong>No Results Found</strong>
            <span>Create a Therapy Progress Note to get started.</span>
          </div>
        ) : (
          <div className="tpn-table-wrap">
            <table className="tpn-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Date</th>
                  <th>Service</th>
                  <th>Topic</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((note) => {
                  const service = [
                    note.group_therapy ? "Group" : "",
                    note.individual_therapy ? "Individual" : "",
                    note.in_person ? "In Person" : "",
                    note.telehealth ? "Telehealth" : "",
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <tr key={note.id}>
                      <td>
                        <strong>{residentName(note.resident_id)}</strong>
                      </td>
                      <td>{note.note_date || "—"}</td>
                      <td>{service || "—"}</td>
                      <td>{note.topic || "—"}</td>
                      <td>
                        <span
                          className={`tpn-status ${
                            note.status === "submitted"
                              ? "tpn-status-submitted"
                              : "tpn-status-draft"
                          }`}
                        >
                          {note.status || "draft"}
                        </span>
                      </td>
                      <td>{note.total_duration || "—"}</td>
                      <td>
                        <div className="tpn-row-actions">{canManage ? <><Link href={`/therapy-progress-notes/${note.id}/edit`}>Edit</Link><button type="button" onClick={() => remove(note.id)}>Delete</button></> : <span className="muted">View only</span>}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
