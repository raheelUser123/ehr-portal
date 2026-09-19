import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { capabilityForPath } from "@/lib/capabilities";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  /*
   * Recovery routes must remain accessible even after Supabase
   * temporarily authenticates the user during password recovery.
   */
  const isRecoveryRoute =
    path.startsWith("/auth/callback") ||
    path.startsWith("/reset-password");

  const isAuthEntryRoute =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/verify") ||
    path.startsWith("/verify-otp");

  const isPublic =
    isRecoveryRoute ||
    isAuthEntryRoute ||
    path.startsWith("/api/auth") ||
    path === "/sitemap.xml" ||
    path === "/robots.txt";

  // Not logged in
  if (!user) {
    if (
      !isPublic &&
      !path.startsWith("/_next") &&
      !path.startsWith("/favicon")
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }

  /*
   * If already logged in, normal auth pages should send user
   * to dashboard.
   *
   * IMPORTANT:
   * Do NOT redirect /reset-password or /auth/callback.
   */
  if (user && isAuthEntryRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Recovery route is allowed for the temporary recovery session.
  if (isRecoveryRoute) {
    return response;
  }

  const needed = capabilityForPath(path);

  if (!needed) {
    return response;
  }

  /*
   * Permission check.
   * SECURITY DEFINER RPC avoids profile RLS incorrectly
   * denying SUPER_ADMIN access.
   */
  const { data: allowed, error } = await supabase.rpc("has_capability", {
    cap: needed,
  });

  if (error) {
    console.error("Capability check failed:", error.message);

    return NextResponse.redirect(
      new URL("/dashboard?access=denied", request.url)
    );
  }

  if (!allowed) {
    return NextResponse.redirect(
      new URL("/dashboard?access=denied", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|sbh-logo.png).*)",
  ],
};