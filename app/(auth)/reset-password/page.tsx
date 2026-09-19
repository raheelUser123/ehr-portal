"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!error && user) {
        setHasSession(true);
      }

      setCheckingSession(false);
    };

    checkSession();
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage("Password updated successfully.");

      /*
       * Password recovery creates a temporary authenticated session.
       * Sign out so /login remains accessible after reset.
       */
      await supabase.auth.signOut();

      window.location.href = "/login?password=updated";
    } catch {
      setError("Unable to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="authside" style={{ minHeight: "100vh" }}>
        <div className="card authcard">
          <h2>Reset Password</h2>
          <p>Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="authside" style={{ minHeight: "100vh" }}>
        <div className="card authcard">
          <h2>Reset Password</h2>

          <div className="err">
            This password reset link is invalid or has expired.
          </div>

          <div style={{ marginTop: 20 }}>
            <Link href="/forgot-password">
              Request a new password reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="authside" style={{ minHeight: "100vh" }}>
      <div className="card authcard">
        <h2>Reset Password</h2>

        <p
          style={{
            marginTop: 0,
            marginBottom: 24,
            color: "#64748b",
            lineHeight: 1.6,
          }}
        >
          Enter your new password below.
        </p>

        {message && <div className="toast">{message}</div>}

        {error && <div className="err">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>New Password</label>

            <input
              className="input"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label>Confirm New Password</label>

            <input
              className="input"
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}