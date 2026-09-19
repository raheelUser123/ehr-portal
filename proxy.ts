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
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isPublic =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/verify") ||
    path.startsWith("/verify-otp") ||
    path.startsWith("/api/auth") ||
    path === "/sitemap.xml" ||
    path === "/robots.txt";

  if (!user) {
    if (!isPublic && !path.startsWith("/_next")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return response;
  }

  if (isPublic && !path.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const needed = capabilityForPath(path);
  if (!needed) return response;

  // IMPORTANT: do not read profiles directly here. RLS can hide the profile
  // from the session client and incorrectly downgrade a Super Admin to Staff.
  // The SECURITY DEFINER RPC performs the permission check safely in Postgres.
  const { data: allowed, error } = await supabase.rpc("has_capability", { cap: needed });

  if (error) {
    console.error("Capability check failed:", error.message);
    return NextResponse.redirect(new URL("/dashboard?access=denied", request.url));
  }

  if (!allowed) {
    return NextResponse.redirect(new URL("/dashboard?access=denied", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.png|sbh-logo.png).*)"],
};
