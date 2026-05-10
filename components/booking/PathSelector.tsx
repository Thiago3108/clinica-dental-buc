"use client";

import { Search, FileText, ChevronRight } from "lucide-react";

type PathSelectorProps = {
  onSelect: (path: "first_visit" | "treatment") => void;
};

export function PathSelector({ onSelect }: PathSelectorProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          ¿Qué tipo de cita necesitas?
        </h2>
        <p className="text-text-secondary">Selecciona la opción que mejor describe tu situación</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onSelect("first_visit")}
          className="group bg-white border-2 border-border hover:border-primary rounded-2xl p-6 sm:p-8 text-left transition-all hover:shadow-lg"
        >
          <div className="w-14 h-14 rounded-xl bg-bg-soft-blue group-hover:bg-primary flex items-center justify-center mb-4 transition-colors">
            <Search className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            Primera visita / Valoración
          </h3>
          <p className="text-sm text-text-secondary mb-4 leading-relaxed">
            Es tu primera vez o no estás seguro de qué tratamiento necesitas. Te asignaremos una consulta de valoración con el especialista adecuado.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Comenzar <ChevronRight className="w-4 h-4" />
          </span>
        </button>

        <button
          onClick={() => onSelect("treatment")}
          className="group bg-white border-2 border-border hover:border-primary rounded-2xl p-6 sm:p-8 text-left transition-all hover:shadow-lg"
        >
          <div className="w-14 h-14 rounded-xl bg-bg-soft-blue group-hover:bg-primary flex items-center justify-center mb-4 transition-colors">
            <FileText className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            Ya tengo diagnóstico
          </h3>
          <p className="text-sm text-text-secondary mb-4 leading-relaxed">
            Ya fuiste valorado por un especialista y conoces el tratamiento que necesitas. Selecciona directamente el procedimiento.
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Continuar <ChevronRight className="w-4 h-4" />
          </span>
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
        <strong>Urgencias:</strong> Si tienes una emergencia dental, por favor contáctanos directamente al teléfono de la clínica para una atención inmediata.
      </div>
    </div>
  );
}
