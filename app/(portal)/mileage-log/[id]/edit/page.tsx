import MileageLogForm from "@/components/MileageLogForm";
export default async function Page({params}:{params:Promise<{id:string}>}){ const {id}=await params; return <MileageLogForm logId={id}/>; }
