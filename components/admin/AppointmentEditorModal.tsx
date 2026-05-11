"use client";

import { useEffect, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, X } from "lucide-react";
import type { AppointmentStatus, Treatment } from "@/lib/types";

type EditableAppointment = {
  id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  is_first_visit: boolean;
  reason: string | null;
  notes: string | null;
  treatment_id: string | null;
  patient: { name: string; phone: string; email: string | null } | null;
  treatment: { name: string; duration_minutes: number } | null;
};

type Props = {
  appointment: EditableAppointment | null;
  treatments: Treatment[];
  timezone: string;
  onClose: () => void;
  onSaved: () => void;
};

const STATUS_OPTIONS: Array<{ value: AppointmentStatus; label: string }> = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "no_show", label: "No asistió" },
];

export function AppointmentEditorModal({ appointment, treatments, timezone, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    patientName: appointment?.patient?.name || "",
    patientPhone: appointment?.patient?.phone || "",
    patientEmail: appointment?.patient?.email || "",
    treatmentId: appointment?.treatment_id || treatments[0]?.id || "",
    startDate: appointment ? format(new Date(appointment.start_time), "yyyy-MM-dd") : "",
    startTime: appointment ? format(new Date(appointment.start_time), "HH:mm") : "",
    status: appointment?.status || "confirmed",
    isFirstVisit: appointment?.is_first_visit || false,
    reason: appointment?.reason || "",
    notes: appointment?.notes || "",
  });

  useEffect(() => {
    setForm({
      patientName: appointment?.patient?.name || "",
      patientPhone: appointment?.patient?.phone || "",
      patientEmail: appointment?.patient?.email || "",
      treatmentId: appointment?.treatment_id || treatments[0]?.id || "",
      startDate: appointment ? format(new Date(appointment.start_time), "yyyy-MM-dd") : "",
      startTime: appointment ? format(new Date(appointment.start_time), "HH:mm") : "",
      status: appointment?.status || "confirmed",
      isFirstVisit: appointment?.is_first_visit || false,
      reason: appointment?.reason || "",
      notes: appointment?.notes || "",
    });
    setError(null);
  }, [appointment, treatments]);

  if (!appointment) return null;

  const selectedTreatment = treatments.find((t) => t.id === form.treatmentId);

  async function handleSave() {
    setError(null);

    if (!form.patientName.trim() || !form.patientPhone.trim()) {
      setError("El nombre y el teléfono son obligatorios");
      return;
    }
    if (!form.treatmentId) {
      setError("Selecciona un tratamiento");
      return;
    }
    if (!form.startDate || !form.startTime) {
      setError("La fecha y la hora son obligatorias");
      return;
    }
    if (!selectedTreatment) {
      setError("El tratamiento seleccionado no es válido");
      return;
    }

    const start = new Date(`${form.startDate}T${form.startTime}:00`);
    const end = new Date(start.getTime() + selectedTreatment.duration_minutes * 60000);

    setSaving(true);
    try {
      const res = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: form.status,
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
        throw new Error(data?.error || "No se pudo guardar la cita");
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la cita");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl bg-white sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-border px-5 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Editar cita</h2>
            <p className="text-xs text-text-secondary">
              {format(new Date(appointment.start_time), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
              {" · "}
              {timezone}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-bg-secondary" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 sm:px-6 py-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre del paciente *">
              <input
                type="text"
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </Field>
            <Field label="Teléfono *">
              <input
                type="tel"
                value={form.patientPhone}
                onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Correo electrónico">
              <input
                type="email"
                value={form.patientEmail}
                onChange={(e) => setForm({ ...form, patientEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </Field>
            <Field label="Estado">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as AppointmentStatus })}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Tratamiento *">
            <select
              value={form.treatmentId}
              onChange={(e) => setForm({ ...form, treatmentId: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              {treatments.map((treatment) => (
                <option key={treatment.id} value={treatment.id}>
                  {treatment.name} ({treatment.duration_minutes} min)
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fecha *">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </Field>
            <Field label="Hora *">
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </Field>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm text-text-primary">
            <input
              type="checkbox"
              checked={form.isFirstVisit}
              onChange={(e) => setForm({ ...form, isFirstVisit: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Es primera visita / valoración
          </label>

          <Field label="Motivo">
            <textarea
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
            />
          </Field>

          <Field label="Notas internas">
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
            />
          </Field>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-border px-5 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm font-medium text-text-primary">
      <span>{label}</span>
      {children}
    </label>
  );
}
