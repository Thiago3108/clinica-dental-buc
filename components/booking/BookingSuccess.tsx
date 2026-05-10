"use client";

import Link from "next/link";
import { CheckCircle2, Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { DentalCenter } from "@/lib/types";

type BookingSuccessProps = {
  center: DentalCenter;
  specialistName: string;
  treatmentName: string;
  date: string;
  timeLabel: string;
};

export function BookingSuccess({
  center,
  specialistName,
  treatmentName,
  date,
  timeLabel,
}: BookingSuccessProps) {
  const dateObj = new Date(`${date}T00:00:00`);

  return (
    <div className="text-center animate-fade-in max-w-xl mx-auto py-8">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-12 h-12 text-success" />
      </div>

      <h1 className="text-3xl font-bold text-text-primary mb-2">
        ¡Cita reservada con éxito!
      </h1>
      <p className="text-text-secondary mb-8">
        Hemos enviado los detalles de tu cita a tu WhatsApp
      </p>

      <div className="bg-white border border-border rounded-2xl p-6 mb-6 text-left shadow-sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Fecha y hora</p>
              <p className="text-text-primary font-semibold capitalize">
                {format(dateObj, "EEEE d 'de' MMMM", { locale: es })}
              </p>
              <p className="text-text-secondary text-sm">{timeLabel}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Especialista</p>
              <p className="text-text-primary font-semibold">{specialistName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Servicio</p>
              <p className="text-text-primary font-semibold">{treatmentName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800 text-left">
        <p>
          Te recomendamos llegar <strong>10 minutos antes</strong> de tu cita.
          Si necesitas cancelar o reprogramar, contáctanos con al menos 24 horas de anticipación.
        </p>
      </div>

      <Link
        href={`/clinica/${center.slug}`}
        className="inline-flex items-center justify-center bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
