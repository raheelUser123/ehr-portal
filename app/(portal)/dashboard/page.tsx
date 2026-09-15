import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import DashboardCharts from "@/components/DashboardCharts";
import Link from "next/link";

export default async function Dashboard(){
  const session=await getSession();
  const db=createAdminClient();
  const [{count:residents},{data:submissions},{count:vitals},{count:notifications},{data:residentRows}]=await Promise.all([
    db.from("residents").select("*",{count:"exact",head:true}),
    db.from("form_submissions").select("status,form_title").order("created_at",{ascending:false}),
    db.from("vitals").select("*",{count:"exact",head:true}),
    db.from("notifications").select("*",{count:"exact",head:true}).eq("user_id",session!.id).eq("read",false),
    db.from("residents").select("status")
  ]);
  const statusMap:Record<string,number>={};
  (residentRows||[]).forEach((r:any)=>{const k=r.status||"unknown";statusMap[k]=(statusMap[k]||0)+1});
  const formMap:Record<string,number>={};
  (submissions||[]).forEach((s:any)=>{const k=s.form_title||"Form";formMap[k]=(formMap[k]||0)+1});
  const formData=Object.entries(formMap).slice(0,7).map(([name,value])=>({name:name.slice(0,14),value}));
  const statusData=Object.entries(statusMap).map(([name,value])=>({name,value}));
  return <>
    <div className="hero"><h1>Resident Care Dashboard</h1><p className="muted">A live view of residents, documentation activity, vitals and outstanding work.</p></div>
    <div className="stats"><div className="card stat"><span className="muted">Total Residents</span><b>{residents||0}</b><span className="badge green">Active census</span></div><div className="card stat"><span className="muted">Form Records</span><b>{submissions?.length||0}</b><span className="badge blue">Draft + submitted</span></div><div className="card stat"><span className="muted">Vitals Entries</span><b>{vitals||0}</b><span className="badge green">Clinical records</span></div><div className="card stat"><span className="muted">Unread Alerts</span><b>{notifications||0}</b><Link href="/notifications" className="badge amber">Review notifications</Link></div></div>
    <DashboardCharts statusData={statusData} formData={formData}/>
    <div className="grid grid3" style={{marginTop:16}}><Link className="card section" href="/resident-chart"><h3>Resident Chart</h3><p className="muted">Open all clinical and resident forms.</p></Link><Link className="card section" href="/resident-vitals"><h3>Record Vitals</h3><p className="muted">Create and review resident vital signs.</p></Link><Link className="card section" href="/residents"><h3>Resident List</h3><p className="muted">Search, add, edit and manage residents.</p></Link></div>
  </>;
}
