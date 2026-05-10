import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracionPage() {
  const supabase = createSupabaseAdminClient();

  const { data: center } = await supabase
    .from("dental_centers")
    .select("*")
    .eq("slug", "buc")
    .single();

  if (!center) return <div>Centro dental no configurado</div>;

  return <SettingsForm center={center} />;
}
