import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireSpecialist } from "@/lib/auth";
import { SpecialistProfileForm } from "@/components/especialista/SpecialistProfileForm";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const me = await requireSpecialist();
  if (!me) redirect("/admin/login");

  const supabase = createSupabaseAdminClient();
  const { data: specialist } = await supabase
    .from("specialists")
    .select("*")
    .eq("id", me.specialistId)
    .single();

  if (!specialist) return <div>Especialista no encontrado</div>;

  return (
    <SpecialistProfileForm specialist={specialist} userEmail={me.email} />
  );
}
