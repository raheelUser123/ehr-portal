import Link from "next/link";
import {ClipboardCheck,History} from "lucide-react";
import {formDefinitions} from "@/lib/form-definitions";
import {createAdminClient} from "@/lib/supabase/admin";
import {getSession,hasCapability} from "@/lib/auth";

export default async function Page(){
 const session=await getSession();const db=createAdminClient();
 const {data:custom}=await db.from("form_templates").select("slug,name,schema,active").eq("active",true).order("name");
 const built=formDefinitions.filter(f=>/assessment|mental status|re-certification|asam/i.test(f.title));
 const customAssess=(custom||[]).filter((x:any)=>/assessment|re-assessment/i.test(`${x.name} ${x.schema?.category||''}`)).map((x:any)=>({slug:x.slug,title:x.name,fields:Array.isArray(x.schema)?x.schema:(x.schema?.fields||[])}));
 const forms=[...built,...customAssess]; const canCreate=hasCapability(session,"forms.create");
 return <><div className="pagehead"><div><h2>Re-Assessment</h2><div className="muted">Assessment and re-assessment documentation from the Resident Chart.</div></div><Link className="btn btn-ghost" href="/resident-chart">All Resident Forms</Link></div><div className="grid formcards">{forms.map(f=><div className="card formcard" key={f.slug}><div><div className="formicon"><ClipboardCheck size={22}/></div><h3>{f.title}</h3><div className="muted" style={{fontSize:11,marginTop:6}}>{f.fields.length} fields</div></div><div className="actions" style={{marginTop:15}}>{canCreate&&<Link className="btn btn-primary compactBtn" href={`/resident-chart/${f.slug}`}>Create</Link>}<Link className="btn btn-ghost compactBtn" href={`/resident-chart/${f.slug}/records`}><History size={14} style={{verticalAlign:'middle',marginRight:4}}/>Records</Link></div></div>)}</div>{!forms.length&&<div className="card empty">No assessment forms are currently available.</div>}</>
}
