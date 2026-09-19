import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const requestedNext =
    url.searchParams.get("next") || "/reset-password";

  const next = requestedNext.startsWith("/")
    ? requestedNext
    : "/reset-password";

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/forgot-password?error=invalid_recovery_link",
        url.origin
      )
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Recovery callback error:", error.message);

    return NextResponse.redirect(
      new URL(
        "/forgot-password?error=expired_recovery_link",
        url.origin
      )
    );
  }

  return NextResponse.redirect(
    new URL(next, url.origin)
  );
}