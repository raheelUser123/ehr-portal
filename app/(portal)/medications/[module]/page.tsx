import MedicationManager from "@/components/MedicationManager";
import ResidentMedicationManager from "@/components/ResidentMedicationManager";
import MARManager from "@/components/MARManager";
import {getSession, hasCapability} from "@/lib/auth";

export default async function Page({params}:{params:Promise<{module:string}>}){
  const {module}=await params;
  const session=await getSession();
  const canManage=!!session&&hasCapability(session,"medications.manage");
  const canAdminister=!!session&&hasCapability(session,"medications.administer");
  if(module==='resident-medication') return <ResidentMedicationManager canManage={canManage}/>;
  if(module==='mar') return <MARManager canAdminister={canAdminister}/>;
  return <MedicationManager module={module} canManage={canManage}/>;
}
