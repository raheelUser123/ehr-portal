import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import MyProfileForm from "@/components/MyProfileForm";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const db = createAdminClient();
  const [{ data: profile }, { data: employee }] = await Promise.all([
    db.from("profiles")
      .select("id,full_name,phone,role,active,organization_id,facility_id,created_at")
      .eq("id", session.id)
      .maybeSingle(),
    db.from("employees")
      .select("employee_number,department,employment_status,hire_date,job_title")
      .eq("profile_id", session.id)
      .maybeSingle(),
  ]);

  if (!profile) redirect("/dashboard");

  const [orgResult, facilityResult, authResult] = await Promise.all([
    profile.organization_id
      ? db.from("organizations").select("name").eq("id", profile.organization_id).maybeSingle()
      : Promise.resolve({ data: null } as any),
    profile.facility_id
      ? db.from("facilities").select("name").eq("id", profile.facility_id).maybeSingle()
      : Promise.resolve({ data: null } as any),
    db.auth.admin.getUserById(session.id),
  ]);

  const authUser = authResult.data?.user || null;

  return (
    <>
      <div className="pagehead">
        <div>
          <div className="muted" style={{ marginBottom: 6 }}><Link href="/dashboard">Dashboard</Link> / My Profile</div>
          <h2>My Profile</h2>
          <div className="muted">Your account, employment and facility information.</div>
        </div>
      </div>
      <MyProfileForm
        profile={profile as any}
        email={authUser?.email || session.email}
        lastSignInAt={authUser?.last_sign_in_at || null}
        organizationName={orgResult.data?.name || null}
        facilityName={facilityResult.data?.name || null}
        employee={employee || null}
      />
    </>
  );
}
