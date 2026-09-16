import TherapyProgressNoteForm from "@/components/TherapyProgressNoteForm";

export default async function EditTherapyProgressNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TherapyProgressNoteForm noteId={id} />;
}
