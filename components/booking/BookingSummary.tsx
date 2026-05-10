"use client";

import { Calendar, Clock, User, Stethoscope, FileText, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Specialty, SpecialistWithSpecialties, Treatment } from "@/lib/types";
import type { PatientFormData } from "./PatientForm";

type BookingSummaryProps = {
  isFirstVisit: boolean;
  specialty: Specialty;
  specialist: SpecialistWithSpecialties;
  treatment: Treatment;
  date: string;
  time: string;
  timeLabel: string;
  patient: PatientFormData;
};

export function BookingSummary({
  isFirstVisit,
  specialty,
  specialist,
  treatment,
  date,
  time,
  timeLabel,
  patient,
}: BookingSummaryProps) {
  const dateObj = new Date(`${date}T00:00:00`);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Confirma tu cita
        </h2>
        <p className="text-text-secondary">Revisa los detalles antes de confirmar</p>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-bg-soft-blue px-6 py-4 border-b border-border">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">
            {isFirstVisit ? "Primera visita - Valoración" : "Cita de tratamiento"}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <SummaryRow icon={Stethoscope} label="Especialidad" value={specialty.name} />
          <SummaryRow icon={User} label="Especialista" value={specialist.name} subtitle={specialist.title || undefined} />
          <SummaryRow
            icon={FileText}
            label={isFirstVisit ? "Tipo de consulta" : "Tratamiento"}
            value={treatment.name}
            subtitle={`${treatment.duration_minutes} minutos`}
          />
          <SummaryRow
            icon={Calendar}
            label="Fecha"
            value={format(dateObj, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
          />
          <SummaryRow icon={Clock} label="Hora" value={timeLabel} />
        </div>

        <div className="border-t border-border px-6 py-4 bg-bg-secondary">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Datos del paciente
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-text-muted" />
              <span className="text-text-primary font-medium">{patient.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-text-muted" />
              <span className="text-text-secondary">{patient.phone}</span>
            </div>
            {patient.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-text-muted" />
                <span className="text-text-secondary">{patient.email}</span>
              </div>
            )}
            {patient.reason && (
              <div className="mt-3 pt-3 border-t border-border-light">
                <p className="text-xs text-text-muted mb-1">Motivo:</p>
                <p className="text-text-secondary">{patient.reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        <p>
          <strong>Importante:</strong> Recibirás una confirmación por WhatsApp al teléfono indicado.
          Te recordaremos tu cita 1 día antes.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-bg-soft-blue flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted uppercase tracking-wide font-medium">{label}</p>
        <p className="text-text-primary font-semibold capitalize">{value}</p>
        {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
