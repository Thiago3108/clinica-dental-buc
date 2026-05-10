"use client";

import { Check } from "lucide-react";
import type { TimeSlot } from "@/lib/types";

type TimeSelectorProps = {
  slots: TimeSlot[];
  selectedTime?: string;
  onSelect: (slot: TimeSlot) => void;
};

export function TimeSelector({ slots, selectedTime, onSelect }: TimeSelectorProps) {
  const availableSlots = slots.filter((s) => s.available);

  if (availableSlots.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            No hay horarios disponibles
          </h2>
          <p className="text-text-secondary">
            Por favor selecciona otra fecha
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Selecciona la hora
        </h2>
        <p className="text-text-secondary">Elige el horario que prefieras</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
        {availableSlots.map((slot) => {
          const isSelected = selectedTime === slot.startTime;
          return (
            <button
              key={slot.startTime}
              onClick={() => onSelect(slot)}
              className={`relative p-3 rounded-xl border-2 text-center font-semibold transition-all ${
                isSelected
                  ? "border-primary bg-primary text-white shadow-lg"
                  : "border-border bg-white text-text-primary hover:border-primary"
              }`}
            >
              {slot.label}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary border-2 border-white flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
