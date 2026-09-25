"use client";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {LayoutDashboard,Users,ClipboardList,Activity,HeartPulse,RefreshCcw,Pill,Bell,Settings,FileText,PlusSquare,ShieldCheck,Building2,Hospital,UserCog,ScrollText,Route,NotebookPen,BriefcaseBusiness,IdCard,GraduationCap,CalendarClock,Clock3,ChartNoAxesCombined,Upload} from "lucide-react";
import type {Capability} from "@/lib/capabilities";

type Item=readonly [string,string,any,Capability];
const residentItems:Item[]=[
["/dashboard","Home",LayoutDashboard,"dashboard.view"],
["/residents","Resident List",Users,"residents.view"],
["/medications","Medications",Pill,"medications.view"],
["/therapy-progress-notes","Therapy Progress Notes",NotebookPen,"therapy.view"],
["/resident-chart","Resident Chart",ClipboardList,"forms.view"],
["/appointments","Appointments",CalendarClock,"appointments.view"],
["/mileage-log","Mileage Log",Route,"mileage.view"],
["/resident-vitals","Resident Vitals",HeartPulse,"vitals.view"],
["/resident-tracking","Resident Tracking",Activity,"tracking.view"],
["/re-assessment","Re-Assessment",RefreshCcw,"tracking.view"],
];
const employeeItems:Item[]=[
["/employee","Employee Home",BriefcaseBusiness,"employee.view"],
["/employee/application","Employment Application",BriefcaseBusiness,"employee.view"],
["/employee/information","Employment Information",IdCard,"employee.view"],
["/employee/training","Training",GraduationCap,"employee.view"],
["/employee/module/time-off-request","Time Off Request",CalendarClock,"employee.view"],
["/employee/time-sheet","Time Sheet / BHT Schedule",Clock3,"employee.view"],
["/employee/module/employee-performance","Employee Performance",ChartNoAxesCombined,"employee.view"],
["/employee/module/employee-tracking","Employee Tracking / Upload",Upload,"employee.view"],
];
const adminItems:Item[]=[
["/admin","Admin Dashboard",ShieldCheck,"admin.dashboard"],
["/admin/users","Users & Staff",UserCog,"admin.users"],
["/admin/organizations","Organizations",Building2,"admin.organizations"],
["/admin/facilities","Facilities",Hospital,"admin.facilities"],
["/admin/roles","Role Capabilities",Users,"admin.roles"],
["/admin/audit-logs","Audit Logs",ScrollText,"admin.audit"],
];
export default function Sidebar({role,capabilities}:{role?:string;capabilities:Capability[]}){
 const path=usePathname(); const can=(c:Capability)=>role==="SUPER_ADMIN"||capabilities.includes(c);
 const item=([href,label,Icon,cap]:Item)=>can(cap)?<Link key={href} className={`navitem ${path===href||path.startsWith(href+"/")?"active":""}`} href={href}><Icon size={18}/><span>{label}</span></Link>:null;
 const visibleResidents=residentItems.filter(x=>can(x[3])); const visibleEmployees=employeeItems.filter(x=>can(x[3])); const visibleAdmin=adminItems.filter(x=>can(x[3]));
 const homeItem=visibleResidents.filter(x=>x[0]==="/dashboard"); const otherResidents=visibleResidents.filter(x=>x[0]!=="/dashboard");
 return <aside className="sidebar">
  <Link href="/dashboard" className="brand brandLink"><div className="brandLogo"><Image src="/sbh-logo.png" alt="SBH" width={58} height={42} priority/></div><div><h1>SBH EHR PORTAL</h1><small>Behavioral Health Management</small></div></Link>
  {homeItem.map(item)}
  {visibleAdmin.length>0&&<><div className="navgroup">Administration</div>{visibleAdmin.map(item)}</>}
  {otherResidents.length>0&&<><div className="navgroup">Resident Workspace</div>{otherResidents.map(item)}</>}
  {visibleEmployees.length>0&&<><div className="navgroup">Employee Workspace</div>{visibleEmployees.map(item)}</>}
  <div className="navgroup">System</div>
  {can("form_builder.manage")&&item(["/form-builder","Form Builder",PlusSquare,"form_builder.manage"])}
  {can("notifications.view")&&item(["/notifications","Notifications",Bell,"notifications.view"])}
  {can("settings.view")&&item(["/settings","Settings",Settings,"settings.view"])}
  <div className="sidebarVersion"><FileText size={14}/>Final v3.3</div>
 </aside>
}
