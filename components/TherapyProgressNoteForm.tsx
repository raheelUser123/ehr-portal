"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RichTextEditor from "./RichTextEditor";
import SignaturePad from "./SignaturePad";

type Resident = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  referenceId?: string | null;
};

type Profile = {
  id: string;
  full_name?: string | null;
  role?: string | null;
};

type NoteForm = {
  resident_id: string;
  group_therapy: boolean;
  individual_therapy: boolean;
  in_person: boolean;
  telehealth: boolean;
  note_date: string;
  start_time: string;
  end_time: string;
  total_duration: string;
  employee_contractor: string;
  facility_address: string;
  topic: string;
  note_summary: string;
  recommendation: string;
  bht_name: string;
  bhp_name: string;
  bht_signature: string;
  bhp_signature: string;
  signer_ids: string[];
  status: "draft" | "submitted";
};

const emptyForm: NoteForm = {
  resident_id: "",
  group_therapy: false,
  individual_therapy: false,
  in_person: false,
  telehealth: false,
  note_date: new Date().toISOString().slice(0, 10),
  start_time: "",
  end_time: "",
  total_duration: "",
  employee_contractor: "",
  facility_address: "",
  topic: "",
  note_summary: "",
  recommendation: "",
  bht_name: "",
  bhp_name: "",
  bht_signature: "",
  bhp_signature: "",
  signer_ids: [],
  status: "draft",
};

export default function TherapyProgressNoteForm({
  noteId,
}: {
  noteId?: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState<NoteForm>(emptyForm);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const [residentResponse, profileResult] = await Promise.all([
        fetch("/api/residents", { cache: "no-store" }),
        supabase.from("profiles").select("id,full_name,role").order("full_name"),
      ]);
      const residentData = await residentResponse.json().catch(() => []);
      setResidents(Array.isArray(residentData) ? residentData : []);
      setProfiles(profileResult.data || []);

      if (noteId) {
        const { data, error } = await supabase
          .from("therapy_progress_notes")
          .select("*")
          .eq("id", noteId)
          .single();

        if (error) {
          setMessage(error.message);
          return;
        }

        if (data) {
          setForm({
            resident_id: data.resident_id || "",
            group_therapy: !!data.group_therapy,
            individual_therapy: !!data.individual_therapy,
            in_person: !!data.in_person,
            telehealth: !!data.telehealth,
            note_date: data.note_date || "",
            start_time: data.start_time || "",
            end_time: data.end_time || "",
            total_duration: data.total_duration || "",
            employee_contractor: data.employee_contractor || "",
            facility_address: data.facility_address || "",
            topic: data.topic || "",
            note_summary: data.note_summary || "",
            recommendation: data.recommendation || "",
            bht_name: data.bht_name || "",
            bhp_name: data.bhp_name || "",
            bht_signature: data.bht_signature || "",
            bhp_signature: data.bhp_signature || "",
            signer_ids: data.signer_ids || [],
            status: data.status === "submitted" ? "submitted" : "draft",
          });
        }
      }
    })();
  }, [noteId, supabase]);

  const update = <K extends keyof NoteForm>(key: K, value: NoteForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async (status: "draft" | "submitted") => {
    setMessage("");

    if (!form.resident_id) {
      setMessage("Please select a resident.");
      return;
    }

    if (status === "submitted" && (!form.topic || !form.note_summary)) {
      setMessage("Topic and Note Summary are required before submission.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      ...form,
      status,
      updated_at: new Date().toISOString(),
      created_by: user?.id || null,
    };

    let result;

    if (noteId) {
      result = await supabase
        .from("therapy_progress_notes")
        .update(payload)
        .eq("id", noteId)
        .select("id")
        .single();
    } else {
      result = await supabase
        .from("therapy_progress_notes")
        .insert(payload)
        .select("id")
        .single();
    }

    if (result.error) {
      setMessage(result.error.message);
      setSaving(false);
      return;
    }

    if (user?.id) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: status === "draft" ? "Therapy note saved" : "Therapy note submitted",
        message:
          status === "draft"
            ? "A Therapy Progress Note was saved as draft."
            : "A Therapy Progress Note was submitted.",
        type: "therapy_progress_note",
        read: false,
      }).then(() => {});
    }

    setSaving(false);
    router.push("/therapy-progress-notes");
    router.refresh();
  };

  const selectedResident = residents.find((r) => r.id === form.resident_id);

  return (
    <div className="tpn-page">
      <div className="tpn-titlebar">
        <button type="button" className="tpn-back" onClick={() => router.back()}>
          ← <span>Back</span>
        </button>
        <h1>Therapy Progress Notes</h1>
        <div />
      </div>

      <div className="tpn-card">
        <div className="tpn-check-row">
          {[
            ["group_therapy", "Group Therapy"],
            ["individual_therapy", "Individual Therapy"],
            ["in_person", "In Person"],
            ["telehealth", "Telehealth"],
          ].map(([key, label]) => (
            <label className="tpn-check" key={key}>
              <input
                type="checkbox"
                checked={Boolean(form[key as keyof NoteForm])}
                onChange={(e) =>
                  update(key as keyof NoteForm, e.target.checked as never)
                }
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="tpn-card">
        <label className="tpn-label">
          Resident&apos;s Name
          <select
            value={form.resident_id}
            onChange={(e) => update("resident_id", e.target.value)}
          >
            <option value="">Select...</option>
            {residents.map((resident) => (
              <option key={resident.id} value={resident.id}>
                {[resident.firstName, resident.lastName].filter(Boolean).join(" ")}
                {resident.referenceId ? ` (${resident.referenceId})` : ""}
              </option>
            ))}
          </select>
        </label>

        {selectedResident && (
          <div className="tpn-selected-resident">
            Selected resident:{" "}
            <strong>
              {[selectedResident.firstName, selectedResident.lastName]
                .filter(Boolean)
                .join(" ")}
            </strong>
          </div>
        )}
      </div>

      <div className="tpn-card">
        <div className="tpn-grid tpn-grid-4">
          <label className="tpn-label">
            Today&apos;s Date
            <input
              type="date"
              value={form.note_date}
              onChange={(e) => update("note_date", e.target.value)}
            />
          </label>
          <label className="tpn-label">
            Start time
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => update("start_time", e.target.value)}
            />
          </label>
          <label className="tpn-label">
            End time
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => update("end_time", e.target.value)}
            />
          </label>
          <label className="tpn-label">
            Total Duration
            <input
              placeholder="hours (Ex. 1hr)"
              value={form.total_duration}
              onChange={(e) => update("total_duration", e.target.value)}
            />
          </label>
        </div>

        <div className="tpn-grid tpn-grid-2">
          <label className="tpn-label">
            Employee/Contractor
            <input
              value={form.employee_contractor}
              onChange={(e) => update("employee_contractor", e.target.value)}
            />
          </label>
          <label className="tpn-label">
            Facility Address
            <input
              value={form.facility_address}
              onChange={(e) => update("facility_address", e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="tpn-card">
        <label className="tpn-label">
          Topic
          <input
            placeholder="Select Topic..."
            value={form.topic}
            onChange={(e) => update("topic", e.target.value)}
          />
        </label>
      </div>

      <div className="tpn-card">
        <div className="tpn-label">Note Summary</div>
        <RichTextEditor
          value={form.note_summary}
          onChange={(value) => update("note_summary", value)}
          placeholder="Write therapy progress note..."
        />

        <div className="tpn-label tpn-editor-title">Recommendation</div>
        <RichTextEditor
          value={form.recommendation}
          onChange={(value) => update("recommendation", value)}
          placeholder="Write recommendation..."
        />
      </div>

      <div className="tpn-card">
        <h3>Signer Names</h3>
        <div className="tpn-grid tpn-grid-2">
          <label className="tpn-label">
            BHT Name
            <input
              value={form.bht_name}
              onChange={(e) => update("bht_name", e.target.value)}
              placeholder="Enter text"
            />
          </label>
          <label className="tpn-label">
            BHP Name
            <input
              value={form.bhp_name}
              onChange={(e) => update("bhp_name", e.target.value)}
              placeholder="Enter text"
            />
          </label>
        </div>

        <div className="tpn-signature-grid">
          <div className="tpn-signature">
            <SignaturePad label="BHT Signature" value={form.bht_signature} onChange={(v) => update("bht_signature", v)} />
            <span>Date Signed: {form.bht_signature ? new Date().toLocaleDateString() : "—"}</span>
          </div>
          <div className="tpn-signature">
            <SignaturePad label="BHP Signature" value={form.bhp_signature} onChange={(v) => update("bhp_signature", v)} />
            <span>Date Signed: {form.bhp_signature ? new Date().toLocaleDateString() : "—"}</span>
          </div>
        </div>

        <label className="tpn-label tpn-signers">
          Signers
          <select
            multiple
            value={form.signer_ids}
            onChange={(e) =>
              update(
                "signer_ids",
                Array.from(e.target.selectedOptions).map((option) => option.value)
              )
            }
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.full_name || profile.id}
                {profile.role ? ` — ${profile.role}` : ""}
              </option>
            ))}
          </select>
          <small>Hold Ctrl/Cmd to select multiple signers.</small>
        </label>
      </div>

      {message && <div className="tpn-message">{message}</div>}

      <div className="tpn-actions">
        <button
          type="button"
          className="tpn-btn tpn-btn-secondary"
          disabled={saving}
          onClick={() => save("draft")}
        >
          Save as Draft
        </button>
        <button
          type="button"
          className="tpn-btn"
          disabled={saving}
          onClick={() => save("submitted")}
        >
          {saving ? "Saving..." : "SUBMIT"}
        </button>
      </div>
    </div>
  );
}
