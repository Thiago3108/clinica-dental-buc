"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Phone, CheckCircle2, XCircle, MessageSquare, Bell, Plus, Pencil, Trash2,
  Loader2, X
} from "lucide-react";
import { format, startOfDay, endOfDay, addDays, isAfter, differenceInHours } from "date-fns";
import { es } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { Badge } from "@/components/ui/Badge";
import {
  buildConfirmationText,
  buildReminderText,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
import type { AppointmentStatus, Treatment } from "@/lib/types";

type AppointmentRow = {
  id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  is_first_visit: boolean;
  confirmation_sent: boolean;
  reminder_sent: boolean;
  appointment_type: "first_visit" | "treatment";
  treatment_id: string | null;
  reason: string | null;
  notes: string | null;
  patient: { id: string; name: string; phone: string; email: string | null } | null;
  treatment: { name: string; duration_minutes: number } | null;
};

type Props = {
  specialistId: string;
  specialistName: string;
  centerName: string;
  centerAddress: string | null;
  timezone: string;
  appointments: AppointmentRow[];
  treatments: Treatment[];
};

export function SpecialistAppointments({
  specialistId,
  specialistName,
  centerName,
  centerAddress,
  timezone,
  appointments,
  treatments,
}: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<"today" | "week" | "upcoming" | "all">("upcoming");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AppointmentRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => filterAppointments(appointments, filter), [appointments, filter]);

  function formatLocal(iso: string, fmt: string) {
    return format(toZonedTime(new Date(iso), timezone), fmt, { locale: es });
  }

  function whatsappConfirmationUrl(apt: AppointmentRow): string | null {
    if (!apt.patient?.phone) return null;
    return buildWhatsAppUrl(
      apt.patient.phone,
      buildConfirmationText({
        patientName: apt.patient.name,
        centerName,
        specialistName,
        treatmentName: apt.treatment?.name || "Consulta",
        date: formatLocal(apt.start_time, "EEEE d 'de' MMMM 'de' yyyy"),
        time: formatLocal(apt.start_time, "h:mm a"),
        address: centerAddress,
        isFirstVisit: apt.is_first_visit,
      })
    );
  }

  function whatsappReminderUrl(apt: AppointmentRow): string | null {
    if (!apt.patient?.phone) return null;
    return buildWhatsAppUrl(
      apt.patient.phone,
      buildReminderText({
        patientName: apt.patient.name,
        centerName,
        specialistName,
        treatmentName: apt.treatment?.name || "Consulta",
        date: formatLocal(apt.start_time, "EEEE d 'de' MMMM"),
        time: formatLocal(apt.start_time, "h:mm a"),
        address: centerAddress,
      })
    );
  }

  async function markConfirmation(id: string) {
    setBusyId(id);
    try {
      await fetch(`/api/appointments/${id}/mark-confirmation-sent`, { method: "POST" });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function markReminder(id: string) {
    setBusyId(id);
    try {
      await fetch(`/api/appointments/${id}/mark-reminder-sent`, { method: "POST" });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    setBusyId(id);
    try {
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAppointment(id: string) {
    if (!confirm("¿Eliminar esta cita? Esta acción no se puede deshacer.")) return;
    setBusyId(id);
    try {
      await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  function highlightClasses(apt: AppointmentRow): string {
    if (apt.status === "cancelled" || apt.status === "completed" || apt.status === "no_show") {
      return "border-border";
    }
    if (!apt.confirmation_sent) {
      return "border-primary/40 bg-bg-soft-blue/40 ring-2 ring-primary/10";
    }
    if (needsReminder(apt)) {
      return "border-amber-300 bg-amber-50/60 ring-2 ring-amber-200/40";
    }
    return "border-border";
  }

  function needsReminder(apt: AppointmentRow): boolean {
    if (apt.reminder_sent || apt.status === "cancelled") return false;
    const start = new Date(apt.start_time);
    const hours = differenceInHours(start, new Date());
    return hours >= 0 && hours <= 30; // dentro de las próximas 30h
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mis citas</h1>
          <p className="text-text-secondary text-sm">Gestiona tu agenda</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva cita
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["today", "week", "upcoming", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-white"
                : "bg-white border border-border text-text-secondary hover:border-primary"
            }`}
          >
            {f === "today" ? "Hoy" : f === "week" ? "Esta semana" : f === "upcoming" ? "Próximas" : "Todas"}
          </button>
        ))}
      </div>

      <div className="bg-bg-soft-blue/40 border border-primary/20 rounded-xl p-3 text-xs text-text-secondary leading-relaxed">
        <strong className="text-primary">Sombreado azul:</strong> cita nueva sin confirmar &middot;{" "}
        <strong className="text-amber-700">Sombreado ámbar:</strong> cita mañana sin recordatorio enviado
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-12 text-center text-text-muted">
            No hay citas en este período
          </div>
        ) : (
          filtered.map((apt) => {
            const showConfirmBtn = !apt.confirmation_sent && apt.status !== "cancelled";
            const showReminderBtn = needsReminder(apt);
            const confirmUrl = whatsappConfirmationUrl(apt);
            const reminderUrl = whatsappReminderUrl(apt);
            return (
              <div
                key={apt.id}
                className={`bg-white border-2 rounded-2xl p-4 sm:p-5 transition-all ${highlightClasses(apt)}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-text-primary">{apt.patient?.name}</h3>
                      {apt.is_first_visit && <Badge variant="primary">Primera visita</Badge>}
                      <Badge variant={statusVariant(apt.status)}>{statusLabel(apt.status)}</Badge>
                      {!apt.confirmation_sent && apt.status !== "cancelled" && (
                        <span className="inline-block text-[10px] uppercase tracking-wide font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Nueva
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary">
                      {apt.treatment?.name} · {apt.treatment?.duration_minutes} min
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-text-primary">
                      {formatLocal(apt.start_time, "d MMM yyyy")}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatLocal(apt.start_time, "h:mm a")}
                    </p>
                  </div>
                </div>

                {apt.reason && (
                  <div className="mb-3 p-3 bg-bg-soft-blue/40 border border-border rounded-xl">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                      Motivo de consulta
                    </p>
                    <p className="text-sm text-text-primary">{apt.reason}</p>
                  </div>
                )}

                {apt.notes && (
                  <div className="mb-3 p-3 bg-bg-secondary border border-border rounded-xl">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                      Notas
                    </p>
                    <p className="text-sm text-text-primary">{apt.notes}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                  <Phone className="w-3.5 h-3.5" />
                  <a href={`tel:${apt.patient?.phone}`} className="hover:text-primary">
                    {apt.patient?.phone}
                  </a>
                </div>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-border-light">
                  {showConfirmBtn && confirmUrl && (
                    <a
                      href={confirmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markConfirmation(apt.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Enviar confirmación
                    </a>
                  )}
                  {showReminderBtn && reminderUrl && (
                    <a
                      href={reminderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markReminder(apt.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium"
                    >
                      <Bell className="w-3.5 h-3.5" /> Enviar recordatorio
                    </a>
                  )}
                  {apt.status !== "completed" && apt.status !== "cancelled" && (
                    <button
                      disabled={busyId === apt.id}
                      onClick={() => updateStatus(apt.id, "completed")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completar
                    </button>
                  )}
                  {apt.status !== "no_show" && apt.status !== "completed" && apt.status !== "cancelled" && (
                    <button
                      disabled={busyId === apt.id}
                      onClick={() => updateStatus(apt.id, "no_show")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-tertiary hover:bg-bg-secondary text-text-secondary rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> No asistió
                    </button>
                  )}
                  <button
                    onClick={() => { setEditing(apt); setShowModal(true); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary hover:bg-bg-tertiary text-text-secondary rounded-lg text-sm font-medium ml-auto"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    disabled={busyId === apt.id}
                    onClick={() => deleteAppointment(apt.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-error rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <AppointmentModal
          specialistId={specialistId}
          editing={editing}
          treatments={treatments}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); router.refresh(); }}
        />
      )}
    </div>
  );
}

// ============================================
// Modal de crear/editar cita
// ============================================
function AppointmentModal({
  specialistId,
  editing,
  treatments,
  onClose,
  onSaved,
}: {
  specialistId: string;
  editing: AppointmentRow | null;
  treatments: Treatment[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    patientName: editing?.patient?.name || "",
    patientPhone: editing?.patient?.phone || "",
    patientEmail: editing?.patient?.email || "",
    treatmentId: editing?.treatment_id || treatments[0]?.id || "",
    startDate: editing ? format(new Date(editing.start_time), "yyyy-MM-dd") : "",
    startTime: editing ? format(new Date(editing.start_time), "HH:mm") : "",
    isFirstVisit: editing?.is_first_visit || false,
    reason: editing?.reason || "",
    notes: editing?.notes || "",
  });

  const selectedTreatment = treatments.find((t) => t.id === form.treatmentId);

  async function handleSave() {
    setError(null);

    if (!form.patientName.trim() || !form.patientPhone.trim()) {
      setError("Nombre y teléfono del paciente son obligatorios");
      return;
    }
    if (!form.treatmentId) {
      setError("Selecciona un tratamiento");
      return;
    }
    if (!form.startDate || !form.startTime) {
      setError("Fecha y hora son obligatorias");
      return;
    }
    if (!selectedTreatment) {
      setError("Tratamiento no válido");
      return;
    }

    setSaving(true);
    const start = new Date(`${form.startDate}T${form.startTime}:00`);
    const end = new Date(start.getTime() + selectedTreatment.duration_minutes * 60000);

    try {
      if (editing) {
        // Actualizar
        const res = await fetch(`/api/especialista/appointments/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            treatmentId: form.treatmentId,
            isFirstVisit: form.isFirstVisit,
            reason: form.reason || null,
            notes: form.notes || null,
            patient: {
              name: form.patientName,
              phone: form.patientPhone,
              email: form.patientEmail || null,
            },
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Error al actualizar la cita");
        }
      } else {
        // Crear
        const res = await fetch(`/api/especialista/appointments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            specialistId,
            treatmentId: form.treatmentId,
            specialtyId: selectedTreatment.specialty_id,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            isFirstVisit: form.isFirstVisit,
            reason: form.reason || null,
            notes: form.notes || null,
            patient: {
              name: form.patientName,
              phone: form.patientPhone,
              email: form.patientEmail || null,
            },
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Error al crear la cita");
        }
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            {editing ? "Editar cita" : "Nueva cita"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Paciente *</label>
            <input
              type="text"
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              placeholder="Nombre completo"
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Teléfono *</label>
              <input
                type="tel"
                value={form.patientPhone}
                onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
                placeholder="3001234567"
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
              <input
                type="email"
                value={form.patientEmail}
                onChange={(e) => setForm({ ...form, patientEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Tratamiento *</label>
            <select
              value={form.treatmentId}
              onChange={(e) => setForm({ ...form, treatmentId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              {treatments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.duration_minutes} min)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Fecha *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Hora *</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFirstVisit}
              onChange={(e) => setForm({ ...form, isFirstVisit: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-text-primary">Es primera visita / valoración</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Motivo (opcional)</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Notas internas (opcional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
              {error}
            </div>
          )}
        </div>
        <div className="p-6 border-t border-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-text-secondary rounded-xl hover:bg-bg-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function filterAppointments<T extends { start_time: string; status: string }>(
  appointments: T[],
  filter: "today" | "week" | "upcoming" | "all"
): T[] {
  const now = new Date();
  if (filter === "today") {
    const start = startOfDay(now);
    const end = endOfDay(now);
    return appointments.filter((a) => {
      const d = new Date(a.start_time);
      return d >= start && d <= end;
    });
  }
  if (filter === "week") {
    const end = addDays(now, 7);
    return appointments.filter((a) => {
      const d = new Date(a.start_time);
      return d >= now && d <= end;
    });
  }
  if (filter === "upcoming") {
    return appointments.filter((a) => isAfter(new Date(a.start_time), startOfDay(now)));
  }
  return appointments;
}

function statusVariant(status: AppointmentStatus): "default" | "success" | "warning" | "error" | "info" {
  return {
    pending: "warning" as const,
    confirmed: "info" as const,
    completed: "success" as const,
    cancelled: "error" as const,
    no_show: "default" as const,
  }[status];
}

function statusLabel(status: AppointmentStatus): string {
  return {
    pending: "Pendiente",
    confirmed: "Confirmada",
    completed: "Completada",
    cancelled: "Cancelada",
    no_show: "No asistió",
  }[status];
}
