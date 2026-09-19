"use client";
import { useSearchParams, useRouter } from "next/navigation";
export default function AccessDeniedNotice(){
 const params=useSearchParams(); const router=useRouter();
 if(params.get("access")!=="denied") return null;
 return <div className="accessDeniedBanner"><div><b>Access restricted</b><span>Your role does not have permission for that section. Ask a Super Admin to enable the required capability.</span></div><button className="btn btn-ghost compactBtn" onClick={()=>router.replace("/dashboard")}>Dismiss</button></div>
}
