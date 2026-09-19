"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const supabase = createClient();

      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo,
        });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      /*
       * Keep response generic so account existence
       * is not exposed.
       */
      setMessage(
        "If an account exists for this email, a password reset link has been sent."
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authside" style={{ minHeight: "100vh" }}>
      <div className="card authcard">
        <h2>Forgot Password</h2>

        <p
          style={{
            marginTop: 0,
            marginBottom: 24,
            color: "#64748b",
            lineHeight: 1.6,
          }}
        >
          Enter your email address and we&apos;ll send you a secure password
          reset link.
        </p>

        {message && <div className="toast">{message}</div>}

        {error && <div className="err">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Email Address</label>

            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: 20,
          }}
        >
          <Link href="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}