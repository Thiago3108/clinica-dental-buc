import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { SpecialistsManager } from "@/components/admin/SpecialistsManager";
import type { SpecialistWithSpecialties } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminEspecialistasPage() {
  const supabase = createSupabaseAdminClient();

  const { data: center } = await supabase
    .from("dental_centers")
    .select("id")
    .eq("slug", "buc")
    .single();

  if (!center) return <div>Centro dental no configurado</div>;

  const [specialistsRes, specialtiesRes, rolesRes] = await Promise.all([
    supabase
      .from("specialists")
      .select(`
        *,
        specialist_specialties (specialty:specialties (*))
      `)
      .eq("dental_center_id", center.id)
      .order("sort_order"),
    supabase
      .from("specialties")
      .select("*")
      .eq("dental_center_id", center.id)
      .order("sort_order"),
    supabase
      .from("user_roles")
      .select("specialist_id, user_id")
      .eq("role", "specialist"),
  ]);

  // Obtener emails de los user_roles
  const credentialsMap: Record<string, { email: string | null }> = {};
  for (const r of rolesRes.data || []) {
    if (r.specialist_id) {
      const { data: u } = await supabase.auth.admin.getUserById(r.user_id);
      credentialsMap[r.specialist_id] = { email: u.user?.email || null };
    }
  }

  const specialists: SpecialistWithSpecialties[] = (specialistsRes.data || []).map((s: { specialist_specialties?: Array<{ specialty: unknown }> } & Record<string, unknown>) => ({
    ...s,
    specialties: (s.specialist_specialties || []).map((ss) => ss.specialty),
  })) as SpecialistWithSpecialties[];

  return (
    <SpecialistsManager
      specialists={specialists}
      specialties={specialtiesRes.data || []}
      dentalCenterId={center.id}
      credentialsMap={credentialsMap}
    />
  );
}
