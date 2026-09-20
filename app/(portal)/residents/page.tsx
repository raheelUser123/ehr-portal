import ResidentManager from "@/components/ResidentManager";
import { getSession, hasCapability } from "@/lib/auth";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;

  return (
    <ResidentManager
      initialSearch={params.search || ""}
      canCreate={hasCapability(session, "residents.create")}
      canEdit={hasCapability(session, "residents.edit")}
      canDelete={hasCapability(session, "residents.delete")}
      canBook={hasCapability(session, "appointments.manage")}
    />
  );
}