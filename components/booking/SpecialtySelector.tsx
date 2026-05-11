"use client";

import { Stethoscope, Sparkles, Shield, AlignCenter, Bone, Syringe, ChevronRight } from "lucide-react";
import type { Specialty } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  tooth: Stethoscope,
  sparkles: Sparkles,
  shield: Shield,
  "align-center": AlignCenter,
  bone: Bone,
  syringe: Syringe,
};

type SpecialtySelectorProps = {
  specialties: Specialty[];
  selectedId?: string;
  onSelect: (specialty: Specialty) => void;
};

export function SpecialtySelector({ specialties, selectedId, onSelect }: SpecialtySelectorProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          ¿En qué área necesitas atención?
        </h2>
        <p className="text-text-secondary">Selecciona la especialidad que mejor se ajuste a tu necesidad</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {specialties.map((s) => {
          const Icon = ICONS[s.icon || ""] || Shield;
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
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? "bg-primary" : "bg-bg-soft-blue group-hover:bg-primary"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      isSelected ? "text-white" : "text-primary group-hover:text-white"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-primary mb-1">{s.name}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{s.description}</p>
                </div>
                <ChevronRight
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    isSelected ? "text-primary translate-x-1" : "text-text-muted"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
