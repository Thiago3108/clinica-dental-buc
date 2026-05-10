import Link from "next/link";
import { Calendar, Users, ClipboardList, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from "date-fns";
import { es } from "date-fns/locale";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = createSupabaseAdminClient();
  const now = new Date();

  const [todayRes, weekRes, upcomingRes, specialistsRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("start_time", startOfDay(now).toISOString())
      .lte("start_time", endOfDay(now).toISOString())
      .neq("status", "cancelled"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("start_time", startOfWeek(now, { weekStartsOn: 1 }).toISOString())
      .lte("start_time", endOfWeek(now, { weekStartsOn: 1 }).toISOString())
      .neq("status", "cancelled"),
    supabase
      .from("appointments")
      .select(`
        id, start_time, status, is_first_visit,
        patient:patients (name, phone),
        specialist:specialists (name),
        treatment:treatments (name)
      `)
      .gte("start_time", now.toISOString())
      .neq("status", "cancelled")
      .order("start_time", { ascending: true })
      .limit(8),
    supabase.from("specialists").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  type DashboardAppointment = {
    id: string;
    start_time: string;
    status: string;
    is_first_visit: boolean;
    patient: { name: string; phone: string } | null;
    specialist: { name: string } | null;
    treatment: { name: string } | null;
  };
  const upcomingAppointments = (upcomingRes.data || []) as unknown as DashboardAppointment[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm">Resumen de la actividad de la clínica</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          label="Citas hoy"
          value={todayRes.count || 0}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Citas esta semana"
          value={weekRes.count || 0}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Especialistas activos"
          value={specialistsRes.count || 0}
          color="purple"
        />
        <StatCard
          icon={Clock}
          label="Próximas citas"
          value={upcomingAppointments.length}
          color="orange"
        />
      </div>

      <div className="bg-white border border-border rounded-2xl">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Próximas citas</h2>
          <Link
            href="/admin/reservas"
            className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
          >
            Ver todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {upcomingAppointments.length === 0 ? (
            <div className="p-12 text-center text-text-muted">No hay citas próximas</div>
          ) : (
            upcomingAppointments.map((apt) => (
              <div key={apt.id} className="p-4 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-text-primary">
                      {apt.patient?.name || "—"}
                    </p>
                    {apt.is_first_visit && (
                      <span className="text-[10px] uppercase font-semibold bg-bg-soft-blue text-primary px-2 py-0.5 rounded-full">
                        Primera visita
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">
                    {apt.specialist?.name} · {apt.treatment?.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-text-primary">
                    {format(new Date(apt.start_time), "d MMM", { locale: es })}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {format(new Date(apt.start_time), "h:mm a")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink href="/admin/reservas" icon={Calendar} label="Gestionar citas" />
        <QuickLink href="/admin/especialistas" icon={Users} label="Especialistas" />
        <QuickLink href="/admin/tratamientos" icon={ClipboardList} label="Tratamientos" />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-border rounded-2xl p-5 hover:border-primary hover:shadow-md transition-all flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-bg-soft-blue flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="font-medium text-text-primary">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-text-muted" />
    </Link>
  );
}
