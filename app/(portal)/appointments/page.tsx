import AppointmentManager from "@/components/AppointmentManager";
import {getSession,hasCapability} from "@/lib/auth";
export default async function Page({searchParams}:{searchParams:Promise<{residentId?:string}>}){const s=await getSession();const sp=await searchParams;return <AppointmentManager initialResidentId={sp.residentId||""} canManage={hasCapability(s,"appointments.manage")}/>}
