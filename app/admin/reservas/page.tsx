import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { AppointmentsTable } from "@/components/admin/AppointmentsTable";

export const dynamic = "force-dynamic";

export default async function AdminReservasPage() {
  const supabase = createSupabaseAdminClient();

  const { data: center } = await supabase
    .from("dental_centers")
    .select("name, address, timezone")
    .eq("slug", "buc")
    .single();

  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      id, start_time, end_time, status, is_first_visit, reason,
      confirmation_sent, reminder_sent,
      patient:patients (name, phone, email),
      specialist:specialists (name),
      treatment:treatments (name, duration_minutes)
    `)
    .order("start_time", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Citas</h1>
        <p className="text-text-secondary text-sm">
          Gestiona todas las citas reservadas en la clínica
        </p>
      </div>

      <AppointmentsTable
        appointments={(appointments || []) as never}
        centerName="Dr. Jonny Contreras"
        centerAddress={center?.address || null}
        timezone={center?.timezone || "America/Bogota"}
      />
    </div>
  );
}
