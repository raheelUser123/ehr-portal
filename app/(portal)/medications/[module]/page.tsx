import MedicationManager from "@/components/MedicationManager";
import ResidentMedicationManager from "@/components/ResidentMedicationManager";
import MARManager from "@/components/MARManager";
export default async function Page({params}:{params:Promise<{module:string}>}){const {module}=await params;if(module==='resident-medication')return <ResidentMedicationManager/>;if(module==='mar')return <MARManager/>;return <MedicationManager module={module}/>}
