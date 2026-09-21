"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SignaturePad from "@/components/SignaturePad";

type FormState = {
  log_date: string;
  resident_initials: string;
  beginning_mileage: string;
  ending_mileage: string;
  total_mileage: string;
  destination: string;
  issues: string;
  driver_signature: string;
  witness_name: string;
  resident_signature: string;
  witness_signature: string;
  signer_ids: string[];
  status: "draft" | "submitted";
};

const empty: FormState = {
  log_date: new Date().toISOString().slice(0, 10),
  resident_initials: "",
  beginning_mileage: "",
  ending_mileage: "",
  total_mileage: "",
  destination: "",
  issues: "",
  driver_signature: "",
  witness_name: "",
  resident_signature: "",
  witness_signature: "",
  signer_ids: [],
  status: "draft",
};

export default function MileageLogForm({ logId }: { logId?: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState<FormState>(empty);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("profiles").select("id,full_name,role").order("full_name");
      setProfiles(p || []);
      if (logId) {
        const { data, error } = await supabase.from("mileage_logs").select("*").eq("id", logId).single();
        if (error) return setMessage(error.message);
        if (data) {
          setForm({
            log_date: data.log_date || "",
            resident_initials: data.resident_initials || "",
            beginning_mileage: data.beginning_mileage?.toString() || "",
            ending_mileage: data.ending_mileage?.toString() || "",
            total_mileage: data.total_mileage?.toString() || "",
            destination: data.destination || "",
            issues: data.issues || "",
            driver_signature: data.driver_signature || "",
            witness_name: data.witness_name || "",
            resident_signature: data.resident_signature || "",
            witness_signature: data.witness_signature || "",
            signer_ids: data.signer_ids || [],
            status: data.status === "submitted" ? "submitted" : "draft",
          });
        }
      }
    })();
  }, [logId, supabase]);

  const set = (key: keyof FormState, value: any) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value } as FormState;
      if (key === "beginning_mileage" || key === "ending_mileage") {
        const start = Number(key === "beginning_mileage" ? value : next.beginning_mileage);
        const end = Number(key === "ending_mileage" ? value : next.ending_mileage);
        next.total_mileage = Number.isFinite(start) && Number.isFinite(end) && end >= start ? String(end - start) : "";
      }
      return next;
    });
  };

  const save = async (status: "draft" | "submitted") => {
    setMessage("");
    if (status === "submitted" && (!form.log_date || !form.resident_initials || !form.destination || !form.driver_signature)) {
      return setMessage("Date, Resident Initials, Destination, and Driver Signature are required before submission.");
    }
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const payload = {
      ...form,
      status,
      beginning_mileage: form.beginning_mileage ? Number(form.beginning_mileage) : null,
      ending_mileage: form.ending_mileage ? Number(form.ending_mileage) : null,
      total_mileage: form.total_mileage ? Number(form.total_mileage) : null,
      created_by: auth.user?.id || null,
      updated_at: new Date().toISOString(),
    };

    const result = logId
      ? await supabase.from("mileage_logs").update(payload).eq("id", logId).select("id").single()
      : await supabase.from("mileage_logs").insert(payload).select("id").single();

    if (result.error) {
      setMessage(result.error.message);
      setSaving(false);
      return;
    }

    if (auth.user?.id) {
      await supabase.from("notifications").insert({
        user_id: auth.user.id,
        title: status === "draft" ? "Mileage log saved" : "Mileage log submitted",
        message: status === "draft" ? "A Mileage Log was saved as draft." : "A Mileage Log was submitted.",
        type: "mileage_log",
        href: "/mileage-log",
        read: false,
      }).then(() => {});
    }

    router.push("/mileage-log");
    router.refresh();
  };

  return (
    <div className="ml-page">
      <div className="ml-titlebar">
        <button onClick={() => router.back()} type="button">← <span>Back</span></button>
        <h1>Mileage Log</h1>
        <div />
      </div>

      <div className="ml-card">
        <div className="ml-grid ml-grid-4">
          <label>Date<input type="date" value={form.log_date} onChange={(e) => set("log_date", e.target.value)} /></label>
          <label>Resident Initials<input value={form.resident_initials} onChange={(e) => set("resident_initials", e.target.value)} /></label>
          <label>Beginning Mileage<input type="number" min="0" value={form.beginning_mileage} onChange={(e) => set("beginning_mileage", e.target.value)} /></label>
          <label>Ending Mileage<input type="number" min="0" value={form.ending_mileage} onChange={(e) => set("ending_mileage", e.target.value)} /></label>
        </div>
        <div className="ml-grid ml-grid-2">
          <label>Total Mileage<input value={form.total_mileage} readOnly /></label>
          <label>Destination<input value={form.destination} onChange={(e) => set("destination", e.target.value)} /></label>
        </div>
        <label className="ml-label">Any Issues<textarea value={form.issues} onChange={(e) => set("issues", e.target.value)} /></label>
      </div>

      <div className="ml-card">
        <h3>Signatures</h3>
        <div className="ml-grid ml-grid-2">
          <SignaturePad label="Driver's Signature" value={form.driver_signature} onChange={(v) => set("driver_signature", v)} />
          <label>Witness Name<input placeholder="Enter text" value={form.witness_name} onChange={(e) => set("witness_name", e.target.value)} /></label>
          <SignaturePad label="Resident/Representative Signature" value={form.resident_signature} onChange={(v) => set("resident_signature", v)} />
          <SignaturePad label="Witness Signature" value={form.witness_signature} onChange={(v) => set("witness_signature", v)} />
        </div>
        <label className="ml-label">Signers
          <select multiple value={form.signer_ids} onChange={(e) => set("signer_ids", Array.from(e.target.selectedOptions).map((o) => o.value))}>
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.id}{p.role ? ` — ${p.role}` : ""}</option>)}
          </select>
          <small>Hold Ctrl/Cmd to select multiple signers.</small>
        </label>
      </div>

      {message && <div className="ml-message">{message}</div>}
      <div className="ml-actions">
        <button className="secondary" type="button" disabled={saving} onClick={() => save("draft")}>Save as Draft</button>
        <button type="button" disabled={saving} onClick={() => save("submitted")}>{saving ? "Saving..." : "SUBMIT"}</button>
      </div>
    </div>
  );
}
