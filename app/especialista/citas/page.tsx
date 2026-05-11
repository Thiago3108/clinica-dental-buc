import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { SpecialistAppointments } from "@/components/especialista/SpecialistAppointments";
import type { Treatment } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CitasPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/admin/login");

  const supabase = createSupabaseAdminClient();

  const { data: specialist } = me.role === "super_admin"
    ? await supabase
        .from("specialists")
        .select("id, name, dental_center_id")
        .eq("is_active", true)
        .order("sort_order")
        .limit(1)
        .single()
    : await supabase
        .from("specialists")
        .select("id, name, dental_center_id")
        .eq("id", me.specialistId)
        .single();

  if (!specialist) return <div>Especialista no encontrado</div>;

  const [centerRes, appointmentsRes, treatmentsRes] = await Promise.all([
    supabase
      .from("dental_centers")
      .select("name, address, timezone")
      .eq("id", specialist.dental_center_id)
      .single(),
    supabase
      .from("appointments")
      .select(`
        id, start_time, end_time, status, is_first_visit, reason, notes,
        confirmation_sent, reminder_sent, appointment_type, treatment_id,
        patient:patients (id, name, phone, email),
        treatment:treatments (name, duration_minutes)
      `)
      .eq("specialist_id", specialist.id)
      .order("start_time", { ascending: true }),
    supabase
      .from("treatments")
      .select("*")
      .eq("dental_center_id", specialist.dental_center_id)
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return (
    <SpecialistAppointments
      specialistId={specialist.id}
      specialistName={specialist.name}
      centerName="Dr. Jonny Contreras"
      centerAddress={centerRes.data?.address || null}
      timezone={centerRes.data?.timezone || "America/Bogota"}
      appointments={(appointmentsRes.data || []) as never}
      treatments={(treatmentsRes.data || []) as Treatment[]}
    />
  );
}
