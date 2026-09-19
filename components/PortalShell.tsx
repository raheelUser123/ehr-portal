import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getSession, hasCapability } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PortalShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) return redirect("/login");

  return (
    <div className="shell">
      <Sidebar role={session.role} capabilities={session.capabilities} />
      <main className="main">
        <Topbar user={{ name: session.name, role: session.role }} canNotifications={hasCapability(session,"notifications.view")} />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
