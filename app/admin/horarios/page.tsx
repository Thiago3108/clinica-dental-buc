import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { HoursManager } from "@/components/admin/HoursManager";

export const dynamic = "force-dynamic";

export default async function AdminHorariosPage() {
  const supabase = createSupabaseAdminClient();

  const { data: center } = await supabase
    .from("dental_centers")
    .select("id")
    .eq("slug", "buc")
    .single();

  if (!center) return <div>Centro dental no configurado</div>;

  const { data: specialists } = await supabase
    .from("specialists")
    .select("*")
    .eq("dental_center_id", center.id)
    .eq("is_active", true)
    .order("sort_order");

  const specialistIds = (specialists || []).map((s) => s.id);

  const [hoursRes, breaksRes] = await Promise.all([
    supabase
      .from("specialist_working_hours")
      .select("*")
      .in("specialist_id", specialistIds.length > 0 ? specialistIds : [""]),
    supabase
      .from("specialist_breaks")
      .select("*")
      .in("specialist_id", specialistIds.length > 0 ? specialistIds : [""]),
  ]);

  return (
    <HoursManager
      specialists={specialists || []}
      workingHours={hoursRes.data || []}
      breaks={breaksRes.data || []}
    />
  );
}
