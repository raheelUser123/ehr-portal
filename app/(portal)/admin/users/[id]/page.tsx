import { notFound, redirect } from "next/navigation";
import AdminUserProfile from "@/components/AdminUserProfile";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession, hasCapability } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasCapability(session, "admin.users")) redirect("/dashboard?access=denied");

  const { id } = await params;
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("id,full_name,phone,role,active,organization_id,facility_id,created_at")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();
  if (String(profile.role || "").toUpperCase() === "SUPER_ADMIN" && session.role !== "SUPER_ADMIN") {
    redirect("/admin/users?access=denied");
  }

  const authResult = await admin.auth.admin.getUserById(id);
  const authUser = authResult.data?.user || null;

  const today = new Date().toISOString().slice(0, 10);

  const [orgResult, facilityResult, employeeResult, appointmentsResult, formsResult, therapyResult, mileageResult, medAdminResult, employeeRecordsResult, auditResult] = await Promise.all([
    profile.organization_id ? admin.from("organizations").select("name").eq("id", profile.organization_id).maybeSingle() : Promise.resolve({ data: null } as any),
    profile.facility_id ? admin.from("facilities").select("name").eq("id", profile.facility_id).maybeSingle() : Promise.resolve({ data: null } as any),
    admin.from("employees").select("employee_number,department,employment_status,hire_date,job_title").eq("profile_id", id).maybeSingle(),
    admin.from("appointments").select("id,appointment_date,start_time,appointment_type,status,provider_name,residents(first_name,last_name)").eq("created_by", id).order("appointment_date", { ascending: false }).limit(100),
    admin.from("form_submissions").select("id,form_slug,form_title,status,created_at").eq("created_by", id).order("created_at", { ascending: false }).limit(100),
    admin.from("therapy_progress_notes").select("id,note_date,topic,status,created_at").eq("created_by", id).order("created_at", { ascending: false }).limit(100),
    admin.from("mileage_logs").select("id,status,created_at").eq("created_by", id),
    admin.from("medication_administration").select("id,administered_at,status").eq("administered_by", id),
    admin.from("employee_records").select("id,module,title,status,created_at,updated_at").eq("employee_id", id).order("updated_at", { ascending: false }).limit(200),
    admin.from("audit_logs").select("id,entity_type,entity_id,action,metadata,created_at").eq("actor_id", id).order("created_at", { ascending: false }).limit(100),
  ]);

  const appointments = appointmentsResult.data || [];
  const forms = formsResult.data || [];
  const therapyNotes = therapyResult.data || [];
  const mileageLogs = mileageResult.data || [];
  const medAdmin = medAdminResult.data || [];
  const employeeRecords = employeeRecordsResult.data || [];
  const auditLogs = auditResult.data || [];

  const upcoming = appointments.filter((a: any) => String(a.appointment_date || "") >= today && !["Completed", "Cancelled", "No Show"].includes(a.status)).length;
  const completed = appointments.filter((a: any) => a.status === "Completed").length;

  return (
    <AdminUserProfile
      profile={profile as any}
      email={authUser?.email || null}
      authCreatedAt={authUser?.created_at || null}
      lastSignInAt={authUser?.last_sign_in_at || null}
      organizationName={orgResult.data?.name || null}
      facilityName={facilityResult.data?.name || null}
      employee={employeeResult.data || null}
      stats={{
        appointments: appointments.length,
        upcomingAppointments: upcoming,
        completedAppointments: completed,
        formRecords: forms.length,
        therapyNotes: therapyNotes.length,
        mileageLogs: mileageLogs.length,
        medicationAdministrations: medAdmin.length,
        employeeRecords: employeeRecords.length,
        employeeDrafts: employeeRecords.filter((r: any) => r.status === "draft").length,
        auditEvents: auditLogs.length,
      }}
      appointments={appointments}
      forms={forms}
      therapyNotes={therapyNotes}
      employeeRecords={employeeRecords}
      auditLogs={auditLogs}
      currentRole={session.role}
    />
  );
}
