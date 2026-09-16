import Link from "next/link";
import { Pill, ClipboardCheck, RefreshCcw, Calculator, FileSignature, Stethoscope } from "lucide-react";
const items=[
  ["resident-medication","Resident Medication",Pill],
  ["mar","Medication Administration Record",ClipboardCheck],
  ["medication-reconciliation","Medication Reconciliation",RefreshCcw],
  ["medication-count","Medication Count",Calculator],
  ["informed-consent","Informed Consent for Medications",FileSignature],
  ["prn","PRN",Stethoscope],
] as const;
export default function MedicationHub(){return <><div className="pagehead"><div><h2>Medications</h2><div className="muted">Resident medication management, administration and medication documentation.</div></div></div><div className="grid grid3">{items.map(([slug,title,Icon])=><Link key={slug} href={`/medications/${slug}`} className="card adminQuick" style={{minHeight:170,alignItems:"center",justifyContent:"center",textAlign:"center",flexDirection:"column"}}><div className="adminIcon"><Icon size={26}/></div><div><b>{title}</b><p>Open {title.toLowerCase()}</p></div></Link>)}</div></>}
