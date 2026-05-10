"use client";

import { Calendar, Check, X } from "lucide-react";
import type { DayAvailability } from "@/lib/types";

type DateSelectorProps = {
  days: DayAvailability[];
  selectedDate?: string;
  onSelect: (date: string) => void;
  loading?: boolean;
};

export function DateSelector({ days, selectedDate, onSelect, loading }: DateSelectorProps) {
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            Selecciona la fecha
          </h2>
          <p className="text-text-secondary">Cargando disponibilidad...</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="bg-bg-tertiary animate-pulse h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Selecciona la fecha
        </h2>
        <p className="text-text-secondary">Elige el día que mejor te convenga</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = selectedDate === day.date;
          const isDisabled = !day.available;

          return (
            <button
              key={day.date}
              onClick={() => !isDisabled && onSelect(day.date)}
              disabled={isDisabled}
              className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                isSelected
                  ? "border-primary bg-primary text-white shadow-lg"
                  : isDisabled
                  ? "border-border bg-bg-tertiary text-text-muted cursor-not-allowed"
                  : "border-border bg-white hover:border-primary"
              }`}
            >
              <div
                className={`text-xs font-medium uppercase ${
                  isSelected ? "text-white/80" : "text-text-muted"
                }`}
              >
                {day.label.split(" ")[0]}
              </div>
              <div
                className={`text-2xl font-bold mt-1 ${
                  isSelected ? "text-white" : isDisabled ? "text-text-muted" : "text-text-primary"
                }`}
              >
                {day.label.split(" ")[1]}
              </div>
              <div className="mt-2 flex justify-center">
                {isDisabled ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase">
                    <X className="w-3 h-3" /> Cerrado
                  </span>
                ) : day.status === "few" ? (
                  <span
                    className={`text-[10px] font-medium uppercase ${
                      isSelected ? "text-white" : "text-warning"
                    }`}
                  >
                    Pocos
                  </span>
                ) : day.status === "full" ? (
                  <span
                    className={`text-[10px] font-medium uppercase ${
                      isSelected ? "text-white" : "text-error"
                    }`}
                  >
                    Lleno
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-medium uppercase ${
                      isSelected ? "text-white" : "text-success"
                    }`}
                  >
                    <Check className="w-3 h-3" /> {day.slotsCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success" />
          Disponible
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-warning" />
          Pocos turnos
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-error" />
          Sin disponibilidad
        </span>
      </div>
    </div>
  );
}
