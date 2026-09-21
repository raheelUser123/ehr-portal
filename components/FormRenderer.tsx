"use client";
import type {FormDefinition,FormField} from "@/lib/form-definitions";
import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import SignaturePad from "@/components/SignaturePad";

function commonValue(label:string,resident:any){
  const l=label.toLowerCase(); if(!resident)return '';
  if(l.includes('ahcccs')||l.includes('member id'))return resident.ahcccsId||'';
  if(l==='dob'||l.includes('date of birth'))return resident.dob?.slice(0,10)||'';
  if(l.includes('admit date'))return resident.admitDate?.slice(0,10)||'';
  if(l.includes('diagnosis'))return resident.diagnosis||'';
  return '';
}
export default function FormRenderer({definition,submissionId}:{definition:FormDefinition;submissionId?:string}){
 const router=useRouter();
 const [residents,setResidents]=useState<any[]>([]); const [residentId,setResidentId]=useState('');
 const [data,setData]=useState<Record<string,any>>({}); const [saving,setSaving]=useState(false); const [msg,setMsg]=useState('');
 useEffect(()=>{fetch('/api/residents').then(r=>r.json()).then(x=>setResidents(Array.isArray(x)?x:[])).catch(()=>setResidents([]))},[]);
 useEffect(()=>{if(submissionId)fetch(`/api/submissions/${submissionId}`).then(r=>r.json()).then(s=>{setResidentId(s.residentId);setData(typeof s.data==='string'?JSON.parse(s.data||'{}'):(s.data||{}))})},[submissionId]);
 const resident=useMemo(()=>residents.find(r=>r.id===residentId),[residents,residentId]);
 useEffect(()=>{if(!resident)return; setData(d=>{const n={...d}; for(const f of definition.fields){const v=commonValue(f.label,resident); if(v && !n[f.name])n[f.name]=v} return n})},[resident,definition.fields]);
 function set(name:string,v:any){
   if(definition.slug==='shift-progress-note' && name==='shift-timing'){
     const times:Record<string,[string,string]>={'Morning Shift':['07:00','15:00'],'Evening Shift':['15:00','23:00'],'Night Shift':['23:00','07:00']};
     setData(d=>({...d,[name]:v,...(times[v]?{'shift-beginning-time':times[v][0],'shift-end-time':times[v][1]}:{})}));
     return;
   }
   setData(d=>({...d,[name]:v}));
 }
 async function save(status:'DRAFT'|'SUBMITTED'){
  if(!residentId){setMsg('Please select a resident first.');return} setSaving(true); setMsg('');
  const url=submissionId?`/api/submissions/${submissionId}`:'/api/submissions'; const method=submissionId?'PUT':'POST';
  const r=await fetch(url,{method,headers:{'content-type':'application/json'},body:JSON.stringify({residentId,formSlug:definition.slug,formTitle:definition.title,status,data})});
  setSaving(false); if(!r.ok){const j=await r.json().catch(()=>({}));setMsg(j.error||'Unable to save');return}
  setMsg(status==='DRAFT'?'Draft saved successfully.':'Form submitted successfully.'); setTimeout(()=>router.push(`/resident-chart/${definition.slug}/records`),700)
 }
 return <>
 <div className="residentBanner"><div><b>Resident</b><select className="select" style={{width:'100%',marginTop:6}} value={residentId} onChange={e=>setResidentId(e.target.value)}><option value="">Select Resident</option>{residents.map(r=><option key={r.id} value={r.id}>{r.firstName} {r.lastName} · {r.referenceId}</option>)}</select></div><div><b>AHCCCS / Member ID</b><span>{resident?.ahcccsId||'—'}</span></div><div><b>DOB</b><span>{resident?.dob?.slice(0,10)||'—'}</span></div><div><b>Admit Date</b><span>{resident?.admitDate?.slice(0,10)||'—'}</span></div><div><b>Status</b><span>{resident?.status||'—'}</span></div></div>
 <div className="card section"><h3>{definition.title}</h3><div className="formgrid">{definition.fields.map((f,i)=><Field key={`${f.name}-${i}`} field={f} value={data[f.name]} setValue={(v:any)=>set(f.name,v)}/>)}</div></div>
 {msg&&<div className={msg.includes('success')?'toast':'err'}>{msg}</div>}
 <div className="stickyActions"><button className="btn btn-ghost" onClick={()=>router.back()}>Cancel</button><button className="btn btn-soft" disabled={saving} onClick={()=>save('DRAFT')}>Save as Draft</button><button className="btn btn-primary" disabled={saving} onClick={()=>save('SUBMITTED')}>{saving?'Saving...':'Submit Form'}</button></div></>
}
function Field({field,value,setValue}:{field:FormField;value:any;setValue:(v:any)=>void}){
 const isSignature=(field.label.toLowerCase().includes('signature')||field.name.toLowerCase().includes('signature')) && field.type!=='checkbox';
 const full=field.type==='textarea'||field.type==='radio'||field.type==='checkbox'||field.options?.length>6||isSignature;
 if(isSignature)return <div className="field full"><SignaturePad label={field.label} value={value||''} onChange={setValue} disabled={field.readonly}/></div>;
 return <div className={`field ${full?'full':''}`}><label>{field.label}{field.required&&<span style={{color:'#e11d48'}}> *</span>}</label>
 {field.type==='textarea'?<textarea className="textarea" disabled={field.readonly} value={value??''} onChange={e=>setValue(e.target.value)}/>
 :field.type==='select'?<select className="select" disabled={field.readonly} value={value??''} onChange={e=>setValue(e.target.value)}><option value="">Select...</option>{field.options.map(o=><option key={o} value={o}>{o}</option>)}</select>
 :field.type==='checkbox'?<label className="checkrow"><input type="checkbox" disabled={field.readonly} checked={Boolean(value)} onChange={e=>setValue(e.target.checked)}/><span>{field.label}</span></label>
 :field.type==='radio'?<div className="radioWrap">{field.options.map(o=><label className="pillcheck" key={o}><input type="radio" name={field.name} disabled={field.readonly} checked={value===o} onChange={()=>setValue(o)}/>{o}</label>)}</div>
 :<input disabled={field.readonly} className="input" value={value??''} onChange={e=>setValue(e.target.value)} type={field.type==='date'?'date':field.type==='time'?'time':field.type==='number'?'number':field.type==='email'?'email':field.type==='tel'?'tel':'text'}/>}</div>
}
