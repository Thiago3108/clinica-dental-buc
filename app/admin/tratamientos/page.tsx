import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { TreatmentsManager } from "@/components/admin/TreatmentsManager";

export const dynamic = "force-dynamic";

export default async function AdminTratamientosPage() {
  const supabase = createSupabaseAdminClient();

  const { data: center } = await supabase
    .from("dental_centers")
    .select("id")
    .eq("slug", "buc")
    .single();

  if (!center) return <div>Centro dental no configurado</div>;

  const [treatmentsRes, specialtiesRes] = await Promise.all([
    supabase
      .from("treatments")
      .select("*")
      .eq("dental_center_id", center.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("specialties")
      .select("*")
      .eq("dental_center_id", center.id)
      .order("sort_order"),
  ]);

  return (
    <TreatmentsManager
      treatments={treatmentsRes.data || []}
      specialties={specialtiesRes.data || []}
      dentalCenterId={center.id}
    />
  );
}
