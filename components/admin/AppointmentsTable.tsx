"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInHours } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Bell, Calendar, Clock, Loader2, MessageSquare, Pencil, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AppointmentEditorModal } from "./AppointmentEditorModal";
import {
  buildConfirmationText,
  buildReminderText,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
import type { AppointmentStatus, Treatment } from "@/lib/types";

type AdminAppointment = {
  id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  is_first_visit: boolean;
  confirmation_sent: boolean;
  reminder_sent: boolean;
  reason: string | null;
  notes: string | null;
  treatment_id: string | null;
  patient: { name: string; phone: string; email: string | null } | null;
  specialist: { name: string } | null;
  treatment: { name: string; duration_minutes: number } | null;
};

type Props = {
  appointments: AdminAppointment[];
  centerName: string;
  centerAddress: string | null;
  timezone: string;
  treatments: Treatment[];
};

const STATUS_OPTIONS: Array<{ value: AppointmentStatus; label: string }> = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "no_show", label: "No asistió" },
];

const STATUS_VARIANTS: Record<AppointmentStatus, "default" | "success" | "warning" | "error" | "info"> = {
  pending: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "error",
  no_show: "default",
};

export function AppointmentsTable({
  appointments,
  centerName,
  centerAddress,
  timezone,
  treatments,
}: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminAppointment | null>(null);

  function formatLocal(iso: string, fmt: string) {
    return format(toZonedTime(new Date(iso), timezone), fmt, { locale: es });
  }

  function needsReminder(apt: AdminAppointment): boolean {
    if (apt.reminder_sent || apt.status === "cancelled") return false;
    const start = new Date(apt.start_time);
    const hours = differenceInHours(start, new Date());
    return hours >= 0 && hours <= 30;
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

  async function markConfirmation(id: string) {
    await fetch(`/api/appointments/${id}/mark-confirmation-sent`, { method: "POST" });
    router.refresh();
  }

  async function markReminder(id: string) {
    await fetch(`/api/appointments/${id}/mark-reminder-sent`, { method: "POST" });
    router.refresh();
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

  if (appointments.length === 0) {
    return (
      <div className="bg-white border border-border rounded-2xl p-12 text-center">
        <p className="text-text-secondary">No hay citas registradas</p>
      </div>
    );
  }

  const renderStatusSelect = (apt: AdminAppointment) => (
    <select
      value={apt.status}
      disabled={busyId === apt.id}
      onChange={(e) => updateStatus(apt.id, e.target.value as AppointmentStatus)}
      className="w-full text-xs border border-border rounded-lg px-2.5 py-2 bg-white"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  const renderActionButtons = (apt: AdminAppointment) => {
    const showConfirm = !apt.confirmation_sent && apt.status !== "cancelled";
    const showReminder = needsReminder(apt);

    const confirmUrl = apt.patient?.phone
      ? buildWhatsAppUrl(
          apt.patient.phone,
          buildConfirmationText({
            patientName: apt.patient.name,
            centerName,
            specialistName: apt.specialist?.name || "el especialista",
            treatmentName: apt.treatment?.name || "Consulta",
            date: formatLocal(apt.start_time, "EEEE d 'de' MMMM 'de' yyyy"),
            time: formatLocal(apt.start_time, "h:mm a"),
            address: centerAddress,
            isFirstVisit: apt.is_first_visit,
          })
        )
      : null;

    const reminderUrl = apt.patient?.phone
      ? buildWhatsAppUrl(
          apt.patient.phone,
          buildReminderText({
            patientName: apt.patient.name,
            centerName,
            specialistName: apt.specialist?.name || "el especialista",
            treatmentName: apt.treatment?.name || "Consulta",
            date: formatLocal(apt.start_time, "EEEE d 'de' MMMM"),
            time: formatLocal(apt.start_time, "h:mm a"),
            address: centerAddress,
          })
        )
      : null;

    return (
      <div className="flex flex-wrap gap-2">
        {showConfirm && confirmUrl && (
          <a
            href={confirmUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markConfirmation(apt.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-medium rounded-lg"
            title="Enviar confirmación"
          >
            <MessageSquare className="w-3 h-3" /> Confirmar
          </a>
        )}
        {showReminder && reminderUrl && (
          <a
            href={reminderUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markReminder(apt.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg"
            title="Enviar recordatorio"
          >
            <Bell className="w-3 h-3" /> Recordar
          </a>
        )}
        <button
          type="button"
          onClick={() => setEditing(apt)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-bg-secondary hover:bg-bg-tertiary text-text-secondary text-xs font-medium rounded-lg"
          title="Editar cita"
        >
          <Pencil className="w-3 h-3" /> Editar
        </button>
        <button
          onClick={() => deleteAppointment(apt.id)}
          disabled={busyId === apt.id}
          className="p-2 hover:bg-red-50 rounded-lg"
          title="Eliminar"
        >
          {busyId === apt.id ? (
            <Loader2 className="w-4 h-4 text-error animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 text-error" />
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      <div className="divide-y divide-border md:hidden">
        {appointments.map((apt) => {
          const showConfirm = !apt.confirmation_sent && apt.status !== "cancelled";
          const showReminder = needsReminder(apt);
          const rowClass =
            showConfirm
              ? "bg-bg-soft-blue/30"
              : showReminder
                ? "bg-amber-50/40"
                : "bg-white";

          return (
            <article key={apt.id} className={`p-4 ${rowClass}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text-primary truncate">{apt.patient?.name}</h3>
                    {apt.is_first_visit && (
                      <span className="text-[10px] uppercase font-semibold bg-bg-soft-blue text-primary px-2 py-0.5 rounded-full">
                        Primera visita
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary truncate">{apt.patient?.phone}</p>
                </div>
                <Badge variant={STATUS_VARIANTS[apt.status]}>{STATUS_OPTIONS.find((o) => o.value === apt.status)?.label}</Badge>
              </div>

              <div className="grid gap-2 text-sm text-text-secondary mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-text-muted" />
                  <span>{apt.specialist?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-text-muted" />
                  <span>
                    {formatLocal(apt.start_time, "d MMM yyyy")} · {formatLocal(apt.start_time, "h:mm a")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  <span>
                    {apt.treatment?.name} · {apt.treatment?.duration_minutes} min
                  </span>
                </div>
              </div>

              <div className="mb-3">{renderStatusSelect(apt)}</div>

              {(apt.reason || apt.notes) && (
                <div className="mb-3 space-y-2 rounded-xl border border-border bg-bg-secondary p-3 text-sm text-text-secondary">
                  {apt.reason && (
                    <p>
                      <span className="font-semibold text-text-primary">Motivo:</span> {apt.reason}
                    </p>
                  )}
                  {apt.notes && (
                    <p>
                      <span className="font-semibold text-text-primary">Notas:</span> {apt.notes}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {renderActionButtons(apt)}
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-bg-secondary border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Paciente</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Especialista</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Servicio</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Fecha/Hora</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Estado</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {appointments.map((apt) => {
              const showConfirm = !apt.confirmation_sent && apt.status !== "cancelled";
              const showReminder = needsReminder(apt);
              const rowClass =
                showConfirm
                  ? "bg-bg-soft-blue/30 hover:bg-bg-soft-blue/50"
                  : showReminder
                    ? "bg-amber-50/40 hover:bg-amber-50/60"
                    : "hover:bg-bg-secondary";

              return (
                <tr key={apt.id} className={rowClass}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{apt.patient?.name}</p>
                      <p className="text-xs text-text-secondary">{apt.patient?.phone}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {apt.is_first_visit && (
                          <span className="text-[9px] uppercase font-semibold bg-bg-soft-blue text-primary px-1.5 py-0.5 rounded">
                            Primera visita
                          </span>
                        )}
                        {showConfirm && (
                          <span className="text-[9px] uppercase font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                            Sin confirmar
                          </span>
                        )}
                        {showReminder && (
                          <span className="text-[9px] uppercase font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                            Recordatorio pendiente
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-primary">{apt.specialist?.name}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    <p>{apt.treatment?.name}</p>
                    <p className="text-xs text-text-muted">{apt.treatment?.duration_minutes} min</p>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <p className="text-text-primary font-medium">
                      {formatLocal(apt.start_time, "d MMM yyyy")}
                    </p>
                    <p className="text-text-secondary text-xs">
                      {formatLocal(apt.start_time, "h:mm a")}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {renderStatusSelect(apt)}
                    <div className="mt-1">
                      <Badge variant={STATUS_VARIANTS[apt.status]}>
                        {STATUS_OPTIONS.find((o) => o.value === apt.status)?.label}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      {renderActionButtons(apt)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AppointmentEditorModal
        appointment={editing}
        treatments={treatments}
        timezone={timezone}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </div>
  );
}
