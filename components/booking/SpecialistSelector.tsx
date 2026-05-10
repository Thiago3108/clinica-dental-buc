"use client";

import { User, Check } from "lucide-react";
import type { SpecialistWithSpecialties } from "@/lib/types";

type SpecialistSelectorProps = {
  specialists: SpecialistWithSpecialties[];
  selectedId?: string;
  onSelect: (specialist: SpecialistWithSpecialties) => void;
  title?: string;
  subtitle?: string;
};

export function SpecialistSelector({
  specialists,
  selectedId,
  onSelect,
  title = "Selecciona el especialista",
  subtitle = "Cada profesional está dedicado a su área de experiencia",
}: SpecialistSelectorProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">{title}</h2>
        <p className="text-text-secondary">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {specialists.map((s) => {
          const isSelected = selectedId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`group bg-white border-2 rounded-2xl p-5 text-left transition-all ${
                isSelected
                  ? "border-primary ring-4 ring-primary/10 shadow-lg"
                  : "border-border hover:border-primary hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-bg-soft-blue overflow-hidden shrink-0 flex items-center justify-center">
                  {s.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-text-primary">{s.name}</h3>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-primary font-medium mt-0.5">{s.title}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.specialties.map((sp) => (
                      <span
                        key={sp.id}
                        className="text-[10px] uppercase tracking-wide font-semibold bg-bg-soft-blue text-primary px-2 py-0.5 rounded-full"
                      >
                        {sp.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
