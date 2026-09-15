import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function PortalShell({children}:{children:React.ReactNode}){const s=await getSession();if(!s)redirect('/login');return <div className="shell"><Sidebar/><main className="main"><Topbar user={{name:s.name,role:s.role}}/><div className="content">{children}</div></main></div>}
