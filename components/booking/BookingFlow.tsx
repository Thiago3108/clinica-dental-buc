"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { PathSelector } from "./PathSelector";
import { SpecialtySelector } from "./SpecialtySelector";
import { SpecialistSelector } from "./SpecialistSelector";
import { TreatmentSelector } from "./TreatmentSelector";
import { DateSelector } from "./DateSelector";
import { TimeSelector } from "./TimeSelector";
import { PatientForm, type PatientFormData } from "./PatientForm";
import { BookingSummary } from "./BookingSummary";
import { BookingSuccess } from "./BookingSuccess";
import type {
  DentalCenter,
  Specialty,
  SpecialistWithSpecialties,
  Treatment,
  TimeSlot,
  DayAvailability,
} from "@/lib/types";

type BookingFlowProps = {
  center: DentalCenter;
  specialties: Specialty[];
  specialists: SpecialistWithSpecialties[];
  treatments: Treatment[];
  consultationTreatments: Record<string, Treatment>;
};

type Path = "first_visit" | "treatment" | null;

export function BookingFlow({
  center,
  specialties,
  specialists,
  treatments,
  consultationTreatments,
}: BookingFlowProps) {
  const [path, setPath] = useState<Path>(null);
  const [step, setStep] = useState(0);
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [specialist, setSpecialist] = useState<SpecialistWithSpecialties | null>(null);
  const [treatment, setTreatment] = useState<Treatment | null>(null);
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [patient, setPatient] = useState<PatientFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const stepsFirstVisit = ["Especialidad", "Especialista", "Fecha", "Hora", "Datos", "Confirmar"];
  const stepsTreatment = ["Especialista", "Tratamiento", "Fecha", "Hora", "Datos", "Confirmar"];
  const steps = path === "first_visit" ? stepsFirstVisit : stepsTreatment;

  useEffect(() => {
    if (specialist && treatment) {
      loadAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialist?.id, treatment?.id]);

  async function loadAvailability() {
    if (!specialist || !treatment) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/availability?specialistId=${specialist.id}&durationMinutes=${treatment.duration_minutes}&dentalCenterId=${center.id}`
      );
      const data = await res.json();
      setDays(data.days || []);
    } catch {
      setError("Error al cargar disponibilidad");
    } finally {
      setLoading(false);
    }
  }

  function handlePathSelect(p: Path) {
    setPath(p);
    setStep(0);
  }

  function handleSpecialtySelect(s: Specialty) {
    setSpecialty(s);
    const matching = specialists.filter((sp) =>
      sp.specialties.some((spc) => spc.id === s.id)
    );
    if (matching.length === 1) {
      setSpecialist(matching[0]);
      const consultation = consultationTreatments[s.id];
      if (consultation) {
        setTreatment(consultation);
        setStep(2);
      } else {
        setStep(1);
      }
    } else {
      setStep(1);
    }
  }

  function handleSpecialistFirstVisit(s: SpecialistWithSpecialties) {
    setSpecialist(s);
    if (specialty) {
      const consultation = consultationTreatments[specialty.id];
      if (consultation) {
        setTreatment(consultation);
        setStep(2);
        return;
      }
    }
    setStep(2);
  }

  function handleSpecialistTreatment(s: SpecialistWithSpecialties) {
    setSpecialist(s);
    setStep(1);
  }

  function handleTreatment(t: Treatment) {
    setTreatment(t);
    setStep(2);
  }

  function handleDate(d: string) {
    setDate(d);
    setSlot(null);
    setStep(3);
  }

  function handleSlot(s: TimeSlot) {
    setSlot(s);
    setStep(4);
  }

  function handlePatient(data: PatientFormData) {
    setPatient(data);
    setStep(5);
  }

  function back() {
    if (step === 0) {
      setPath(null);
      return;
    }

    if (path === "first_visit" && step === 2) {
      const matching = specialists.filter((sp) =>
        specialty ? sp.specialties.some((spc) => spc.id === specialty.id) : false
      );
      if (matching.length === 1) {
        setSpecialty(null);
        setSpecialist(null);
        setTreatment(null);
        setStep(0);
        return;
      }
    }

    setStep(step - 1);
  }

  async function confirmBooking() {
    if (!specialist || !treatment || !slot || !patient || !date) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dentalCenterId: center.id,
          specialistId: specialist.id,
          specialtyId: specialty?.id || treatment.specialty_id,
          treatmentId: treatment.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          appointmentType: path,
          isFirstVisit: path === "first_visit",
          patient: {
            name: patient.name,
            phone: patient.phone,
            email: patient.email || null,
          },
          reason: patient.reason || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al crear la cita");
      }

      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  }

  if (success && specialist && treatment && date && slot) {
    return (
      <BookingSuccess
        center={center}
        specialistName={specialist.name}
        treatmentName={treatment.name}
        date={date}
        timeLabel={slot.label}
      />
    );
  }

  if (!path) {
    return <PathSelector onSelect={handlePathSelect} />;
  }

  const isFirstVisit = path === "first_visit";

  let stepContent: React.ReactNode = null;

  if (isFirstVisit) {
    if (step === 0) {
      stepContent = (
        <SpecialtySelector
          specialties={specialties}
          selectedId={specialty?.id}
          onSelect={handleSpecialtySelect}
        />
      );
    } else if (step === 1) {
      const matching = specialists.filter((sp) =>
        specialty ? sp.specialties.some((spc) => spc.id === specialty.id) : false
      );
      stepContent = (
        <SpecialistSelector
          specialists={matching}
          selectedId={specialist?.id}
          onSelect={handleSpecialistFirstVisit}
          title="Selecciona el especialista"
          subtitle="Estos profesionales atienden esta especialidad"
        />
      );
    } else if (step === 2) {
      stepContent = (
        <DateSelector
          days={days}
          selectedDate={date || undefined}
          onSelect={handleDate}
          loading={loading}
        />
      );
    } else if (step === 3) {
      const dayData = days.find((d) => d.date === date);
      stepContent = (
        <TimeSelector
          slots={dayData?.slots || []}
          selectedTime={slot?.startTime}
          onSelect={handleSlot}
        />
      );
    } else if (step === 4) {
      stepContent = (
        <PatientForm
          isFirstVisit
          defaultValues={patient || undefined}
          onSubmit={handlePatient}
        />
      );
    } else if (step === 5 && specialty && specialist && treatment && slot && date && patient) {
      stepContent = (
        <BookingSummary
          isFirstVisit
          specialty={specialty}
          specialist={specialist}
          treatment={treatment}
          date={date}
          time={slot.startTime}
          timeLabel={slot.label}
          patient={patient}
        />
      );
    }
  } else {
    if (step === 0) {
      stepContent = (
        <SpecialistSelector
          specialists={specialists}
          selectedId={specialist?.id}
          onSelect={handleSpecialistTreatment}
          title="Selecciona el especialista"
          subtitle="Elige al profesional que te atenderá"
        />
      );
    } else if (step === 1) {
      const filtered = treatments.filter((t) =>
        specialist?.specialties.some((sp) => sp.id === t.specialty_id)
      );
      stepContent = (
        <TreatmentSelector
          treatments={filtered}
          selectedId={treatment?.id}
          onSelect={handleTreatment}
        />
      );
    } else if (step === 2) {
      stepContent = (
        <DateSelector
          days={days}
          selectedDate={date || undefined}
          onSelect={handleDate}
          loading={loading}
        />
      );
    } else if (step === 3) {
      const dayData = days.find((d) => d.date === date);
      stepContent = (
        <TimeSelector
          slots={dayData?.slots || []}
          selectedTime={slot?.startTime}
          onSelect={handleSlot}
        />
      );
    } else if (step === 4) {
      stepContent = (
        <PatientForm
          isFirstVisit={false}
          defaultValues={patient || undefined}
          onSubmit={handlePatient}
        />
      );
    } else if (step === 5 && specialist && treatment && slot && date && patient) {
      const specialtyForTreatment = specialties.find((s) => s.id === treatment.specialty_id);
      if (specialtyForTreatment) {
        stepContent = (
          <BookingSummary
            isFirstVisit={false}
            specialty={specialtyForTreatment}
            specialist={specialist}
            treatment={treatment}
            date={date}
            time={slot.startTime}
            timeLabel={slot.label}
            patient={patient}
          />
        );
      }
    }
  }

  const showPatientFormSubmit = step === 4;
  const showConfirmButton = step === 5;

  return (
    <div className="space-y-8">
      <StepIndicator steps={steps} currentStep={step} />

      <div className="min-h-[400px]">{stepContent}</div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
        <button
          onClick={back}
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Atrás
        </button>

        {showPatientFormSubmit && (
          <button
            type="submit"
            form="patient-form"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Continuar
          </button>
        )}

        {showConfirmButton && (
          <button
            onClick={confirmBooking}
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirmando...
              </>
            ) : (
              "Confirmar cita"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
