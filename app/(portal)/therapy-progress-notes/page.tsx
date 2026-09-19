import TherapyProgressNotesList from "@/components/TherapyProgressNotesList";import {getSession,hasCapability} from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function TherapyProgressNotesPage(){const s=await getSession();return <TherapyProgressNotesList canManage={hasCapability(s,"therapy.manage")}/>}
