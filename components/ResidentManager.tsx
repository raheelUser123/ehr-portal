"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Resident = {
  id: string;
  firstName: string;
  lastName: string;
  referenceId: string;
  ahcccsId?: string | null;
  phone?: string | null;
  email?: string | null;
  diagnosis?: string | null;
  facility?: string | null;
  status?: string | null;
  dob?: string | null;
  admitDate?: string | null;
};

type Props = {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canBook: boolean;
  initialSearch?: string;
};

const normalize = (value?: string | null) =>
  String(value || "")
    .trim()
    .toLowerCase();

export default function ResidentManager({
  canCreate,
  canEdit,
  canDelete,
  canBook,
  initialSearch = "",
}: Props) {
  const [rows, setRows] = useState<Resident[]>([]);
  const [q, setQ] = useState(initialSearch);

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Resident | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      setLoading(true);

      const response = await fetch("/api/residents", {
        cache: "no-store",
      });

      const json = await response.json().catch(() => []);

      if (!response.ok) {
        setError(
          json?.error || "Unable to load residents. Please try again."
        );
        setRows([]);
        return;
      }

      setRows(Array.isArray(json) ? json : []);
    } catch {
      setError("Unable to load residents. Please check your connection.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function closeModal() {
    setOpen(false);
    setEdit(null);
    setError("");
  }

  function openCreateModal() {
    setEdit(null);
    setError("");
    setSuccess("");
    setOpen(true);
  }

  function openEditModal(resident: Resident) {
    setEdit(resident);
    setError("");
    setSuccess("");
    setOpen(true);
  }

  function getDuplicateMessage(
    body: Record<string, FormDataEntryValue>
  ): string | null {
    const referenceId = normalize(String(body.referenceId || ""));
    const ahcccsId = normalize(String(body.ahcccsId || ""));
    const email = normalize(String(body.email || ""));

    const others = rows.filter((resident) => resident.id !== edit?.id);

    if (
      referenceId &&
      others.some(
        (resident) => normalize(resident.referenceId) === referenceId
      )
    ) {
      return "A resident with this Reference ID already exists. Please use a unique Reference ID.";
    }

    if (
      ahcccsId &&
      others.some(
        (resident) => normalize(resident.ahcccsId) === ahcccsId
      )
    ) {
      return "A resident with this AHCCCS / Member ID already exists.";
    }

    if (
      email &&
      others.some((resident) => normalize(resident.email) === email)
    ) {
      return "A resident with this email address already exists.";
    }

    return null;
  }

  function friendlyApiError(message?: string) {
    const text = message || "";

    if (
      text.includes("residents_reference_id_unique") ||
      text.toLowerCase().includes("reference_id")
    ) {
      return "A resident with this Reference ID already exists. Please use a unique Reference ID.";
    }

    if (
      text.includes("residents_ahcccs_id_unique") ||
      text.toLowerCase().includes("ahcccs")
    ) {
      return "A resident with this AHCCCS / Member ID already exists.";
    }

    if (
      text.includes("residents_email_unique") ||
      text.toLowerCase().includes("email")
    ) {
      return "A resident with this email address already exists.";
    }

    if (
      text.includes("duplicate key value") ||
      text.includes("23505")
    ) {
      return "This resident already exists. Please check the Reference ID, AHCCCS / Member ID, and email address.";
    }

    return text || "Unable to save resident.";
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const body = Object.fromEntries(formData.entries());

    body.firstName = String(body.firstName || "").trim();
    body.lastName = String(body.lastName || "").trim();
    body.referenceId = String(body.referenceId || "").trim();
    body.ahcccsId = String(body.ahcccsId || "").trim();
    body.phone = String(body.phone || "").trim();
    body.email = String(body.email || "")
      .trim()
      .toLowerCase();
    body.diagnosis = String(body.diagnosis || "").trim();
    body.facility = String(body.facility || "").trim();
    body.status = String(body.status || "").trim();

    if (!body.firstName || !body.lastName || !body.referenceId) {
      setError(
        "First Name, Last Name, and Reference ID are required."
      );
      return;
    }

    const duplicateMessage = getDuplicateMessage(body);

    if (duplicateMessage) {
      setError(duplicateMessage);
      return;
    }

    try {
      setSaving(true);

      const url = edit
        ? `/api/residents/${edit.id}`
        : "/api/residents";

      const response = await fetch(url, {
        method: edit ? "PUT" : "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(friendlyApiError(json?.error));
        return;
      }

      setSuccess(
        edit
          ? "Resident updated successfully."
          : "Resident added successfully."
      );

      setOpen(false);
      setEdit(null);

      await load();

      setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch {
      setError(
        "Unable to save resident. Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    const resident = rows.find((row) => row.id === id);

    const confirmed = window.confirm(
      `Delete ${
        resident
          ? `${resident.firstName} ${resident.lastName}`
          : "this resident"
      } and all related records?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/residents/${id}`, {
        method: "DELETE",
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          json?.error || "Unable to delete resident."
        );
        return;
      }

      setRows((current) =>
        current.filter((resident) => resident.id !== id)
      );

      setSuccess("Resident deleted successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch {
      setError(
        "Unable to delete resident. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) return rows;

    return rows.filter((resident) =>
      [
        resident.firstName,
        resident.lastName,
        resident.referenceId,
        resident.ahcccsId,
        resident.phone,
        resident.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [rows, q]);

  return (
    <>
      <div className="pagehead">
        <div>
          <h2>All Residents</h2>

          <div className="muted">
            Resident census, profiles and appointment access.
          </div>
        </div>

        {canCreate && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateModal}
          >
            + Add Resident
          </button>
        )}
      </div>

      {success && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 15px",
            borderRadius: 10,
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#047857",
            fontWeight: 600,
          }}
        >
          {success}
        </div>
      )}

      {!open && error && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 15px",
            borderRadius: 10,
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            color: "#be123c",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      <div className="card section">
        <div className="toolbar">
          <input
            className="input"
            style={{
              minWidth: 300,
            }}
            placeholder="Search by name, reference ID, AHCCCS ID or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <span className="muted">
            {filtered.length}{" "}
            {filtered.length === 1 ? "resident" : "residents"}
          </span>
        </div>
      </div>

      <div className="card tablewrap">
        <table className="table">
          <thead>
            <tr>
              <th>Resident Name</th>
              <th>Reference ID</th>
              <th>AHCCCS / Member ID</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Appointment</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((resident) => (
              <tr key={resident.id}>
                <td>
                  <b>
                    {resident.firstName} {resident.lastName}
                  </b>
                </td>

                <td>{resident.referenceId || "—"}</td>

                <td>{resident.ahcccsId || "—"}</td>

                <td>{resident.phone || "—"}</td>

                <td>{resident.email || "—"}</td>

                <td>
                  <span
                    className={`badge ${
                      (resident.status || "").toLowerCase() ===
                      "active"
                        ? "green"
                        : "gray"
                    }`}
                  >
                    {resident.status || "—"}
                  </span>
                </td>

                <td>
                  {canBook ? (
                    <Link
                      className="btn btn-soft compactBtn"
                      href={`/appointments?residentId=${resident.id}`}
                    >
                      Book Appointment
                    </Link>
                  ) : (
                    <span className="muted">View only</span>
                  )}
                </td>

                <td>
                  <div className="actions">
                    {canEdit && (
                      <button
                        type="button"
                        className="btn btn-ghost compactBtn"
                        onClick={() =>
                          openEditModal(resident)
                        }
                      >
                        Edit
                      </button>
                    )}

                    {canDelete && (
                      <button
                        type="button"
                        className="btn btn-danger compactBtn"
                        disabled={deletingId === resident.id}
                        onClick={() => del(resident.id)}
                      >
                        {deletingId === resident.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="empty">
            Loading residents...
          </div>
        )}

        {!loading && !filtered.length && (
          <div className="empty">
            No residents found.
          </div>
        )}
      </div>

      {open && (
        <div className="modalOverlay">
          <form
            className="card section modalCard"
            onSubmit={save}
          >
            <div className="pagehead">
              <div>
                <h2>
                  {edit
                    ? "Edit Resident"
                    : "Add Resident"}
                </h2>

                <div className="muted">
                  Resident demographics and admission
                  details.
                </div>
              </div>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeModal}
              >
                Close
              </button>
            </div>

            {error && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px 15px",
                  borderRadius: 10,
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  color: "#be123c",
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <div className="formgrid">
              <div className="field">
                <label>
                  First Name <span style={{ color: "red" }}>*</span>
                </label>

                <input
                  className="input"
                  name="firstName"
                  defaultValue={edit?.firstName || ""}
                  required
                />
              </div>

              <div className="field">
                <label>
                  Last Name <span style={{ color: "red" }}>*</span>
                </label>

                <input
                  className="input"
                  name="lastName"
                  defaultValue={edit?.lastName || ""}
                  required
                />
              </div>

              <div className="field">
                <label>
                  Reference ID{" "}
                  <span style={{ color: "red" }}>*</span>
                </label>

                <input
                  className="input"
                  name="referenceId"
                  defaultValue={edit?.referenceId || ""}
                  required
                />

                <small className="muted">
                  Must be unique for every resident.
                </small>
              </div>

              <div className="field">
                <label>AHCCCS / Member ID</label>

                <input
                  className="input"
                  name="ahcccsId"
                  defaultValue={edit?.ahcccsId || ""}
                />

                <small className="muted">
                  Cannot be shared by multiple residents.
                </small>
              </div>

              <div className="field">
                <label>Phone</label>

                <input
                  className="input"
                  name="phone"
                  type="tel"
                  defaultValue={edit?.phone || ""}
                />
              </div>

              <div className="field">
                <label>Email</label>

                <input
                  className="input"
                  name="email"
                  type="email"
                  defaultValue={edit?.email || ""}
                />

                <small className="muted">
                  Email must be unique if provided.
                </small>
              </div>

              <div className="field">
                <label>Diagnosis</label>

                <input
                  className="input"
                  name="diagnosis"
                  defaultValue={edit?.diagnosis || ""}
                />
              </div>

              <div className="field">
                <label>Facility</label>

                <input
                  className="input"
                  name="facility"
                  defaultValue={edit?.facility || ""}
                />
              </div>

              <div className="field">
                <label>Status</label>

                <select
                  className="input"
                  name="status"
                  defaultValue={edit?.status || "active"}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                  <option value="discharged">
                    Discharged
                  </option>
                </select>
              </div>

              <div className="field">
                <label>Date of Birth</label>

                <input
                  className="input"
                  type="date"
                  name="dob"
                  defaultValue={
                    edit?.dob?.slice(0, 10) || ""
                  }
                />
              </div>

              <div className="field">
                <label>Admit Date</label>

                <input
                  className="input"
                  type="date"
                  name="admitDate"
                  defaultValue={
                    edit?.admitDate?.slice(0, 10) || ""
                  }
                />
              </div>
            </div>

            <div
              className="actions"
              style={{
                justifyContent: "flex-end",
                marginTop: 18,
              }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : edit
                  ? "Update Resident"
                  : "Save Resident"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}