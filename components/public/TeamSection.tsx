import { User, Award } from "lucide-react";
import type { SpecialistWithSpecialties } from "@/lib/types";

export function TeamSection({ specialists }: { specialists: SpecialistWithSpecialties[] }) {
  return (
    <section id="equipo" className="py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-primary-light font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Nuestro equipo
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4 tracking-tight text-balance">
            Especialistas a tu servicio
          </h2>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            Conoce al equipo de profesionales que cuidarán de tu sonrisa
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {specialists.map((s) => (
            <div
              key={s.id}
              className="group relative bg-white rounded-3xl overflow-hidden border border-border hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500"
            >
              {/* Foto del especialista */}
              <div className="relative aspect-[3/4] bg-bg-soft-blue overflow-hidden">
                {s.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.photo_url}
                    alt={s.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-20 h-20 text-primary/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/0 to-transparent" />

                {/* Specialty badges sobre foto */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                  {s.specialties.slice(0, 2).map((sp) => (
                    <span
                      key={sp.id}
                      className="text-[10px] uppercase tracking-wide font-bold bg-white/95 backdrop-blur-sm text-primary px-2.5 py-1 rounded-full"
                    >
                      {sp.name}
                    </span>
                  ))}
                  {s.specialties.length > 2 && (
                    <span className="text-[10px] uppercase tracking-wide font-bold bg-primary text-white px-2.5 py-1 rounded-full">
                      +{s.specialties.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start gap-2 mb-1">
                  <Award className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <h3 className="text-lg font-bold text-text-primary leading-tight">
                    {s.name}
                  </h3>
                </div>
                <p className="text-sm text-primary font-semibold mb-2 pl-6">{s.title}</p>
                {s.description && (
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 pl-6">
                    {s.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
