import Link from "next/link";
import { Calendar, Users, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { addDays, startOfDay, endOfDay, format } from "date-fns";
import { es } from "date-fns/locale";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireSpecialist } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EspecialistaDashboard() {
  const me = await requireSpecialist();
  if (!me) redirect("/admin/login");

  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();
  const weekEnd = addDays(now, 7).toISOString();

  const [todayRes, weekRes, pendingConfRes, pendingRemRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, start_time, end_time, status, is_first_visit, confirmation_sent, reminder_sent, patient:patients(name), treatment:treatments(name)")
      .eq("specialist_id", me.specialistId)
      .gte("start_time", todayStart)
      .lte("start_time", todayEnd)
      .neq("status", "cancelled")
      .order("start_time"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("specialist_id", me.specialistId)
      .gte("start_time", now.toISOString())
      .lte("start_time", weekEnd)
      .neq("status", "cancelled"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("specialist_id", me.specialistId)
      .eq("confirmation_sent", false)
      .gte("start_time", now.toISOString())
      .neq("status", "cancelled"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("specialist_id", me.specialistId)
      .eq("reminder_sent", false)
      .gte("start_time", now.toISOString())
      .lte("start_time", addDays(now, 1).toISOString())
      .neq("status", "cancelled"),
  ]);

  const todayAppointments = todayRes.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Bienvenido</h1>
        <p className="text-text-secondary text-sm">Resumen de tu agenda</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Calendar className="w-5 h-5 text-primary" />}
          bg="bg-bg-soft-blue"
          value={todayAppointments.length}
          label="Citas hoy"
        />
        <StatCard
          icon={<Users className="w-5 h-5 text-green-600" />}
          bg="bg-green-50"
          value={weekRes.count || 0}
          label="Próximos 7 días"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
          bg="bg-amber-50"
          value={pendingConfRes.count || 0}
          label="Sin confirmar"
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5 text-rose-600" />}
          bg="bg-rose-50"
          value={pendingRemRes.count || 0}
          label="Recordatorios pendientes"
        />
      </div>

      <div className="bg-white border border-border rounded-2xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-bold text-text-primary">Agenda de hoy</h2>
            <p className="text-xs text-text-secondary">
              {format(now, "EEEE d 'de' MMMM", { locale: es })}
            </p>
          </div>
          <Link
            href="/especialista/citas"
            className="text-sm font-medium text-primary hover:text-primary-dark inline-flex items-center gap-1"
          >
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {todayAppointments.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-sm">
              No tienes citas programadas para hoy
            </div>
          ) : (
            todayAppointments.map((apt) => {
              const p = (apt.patient as unknown as { name: string } | null);
              const t = (apt.treatment as unknown as { name: string } | null);
              return (
                <div key={apt.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-text-primary truncate">{p?.name}</p>
                    <p className="text-xs text-text-secondary truncate">{t?.name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-text-primary">
                      {format(new Date(apt.start_time), "h:mm a")}
                    </p>
                    {!apt.confirmation_sent && (
                      <span className="inline-block text-[10px] uppercase tracking-wide font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded mt-0.5">
                        Sin confirmar
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, bg, value, label }: { icon: React.ReactNode; bg: string; value: number; label: string }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-4">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary">{label}</p>
    </div>
  );
}
