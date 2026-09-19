import MileageLogList from "@/components/MileageLogList";import {getSession,hasCapability} from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function MileageLogPage(){const s=await getSession();return <MileageLogList canManage={hasCapability(s,"mileage.manage")}/>}
