"use client";

import { Clock, Check } from "lucide-react";
import type { Treatment } from "@/lib/types";

type TreatmentSelectorProps = {
  treatments: Treatment[];
  selectedId?: string;
  onSelect: (treatment: Treatment) => void;
};

export function TreatmentSelector({ treatments, selectedId, onSelect }: TreatmentSelectorProps) {
  if (treatments.length === 0) {
    return (
      <div className="text-center py-12 bg-bg-soft-blue/40 rounded-2xl">
        <p className="text-text-secondary">
          No hay tratamientos disponibles para esta selección.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Selecciona el tratamiento
        </h2>
        <p className="text-text-secondary">Elige el procedimiento que necesitas</p>
      </div>

      <div className="space-y-3">
        {treatments.map((t) => {
          const isSelected = selectedId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className={`w-full bg-white border-2 rounded-xl p-4 sm:p-5 text-left transition-all ${
                isSelected
                  ? "border-primary ring-4 ring-primary/10 shadow-lg"
                  : "border-border hover:border-primary hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-primary">{t.name}</h3>
                  {t.description && (
                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">{t.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-text-secondary">
                      <Clock className="w-4 h-4" />
                      {t.duration_minutes} min
                    </span>
                    {t.price !== null && t.price > 0 && (
                      <span className="font-semibold text-primary">
                        ${t.price.toLocaleString("es-CO")}
                      </span>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
