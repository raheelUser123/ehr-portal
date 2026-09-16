import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PortalShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="shell">
      <Sidebar role={session.role} />
      <main className="main">
        <Topbar user={{ name: session.name, role: session.role }} />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
