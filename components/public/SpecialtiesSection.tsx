import { Stethoscope, Sparkles, Shield, AlignCenter, Bone, Syringe, ArrowUpRight } from "lucide-react";
import type { Specialty } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  tooth: Stethoscope,
  sparkles: Sparkles,
  shield: Shield,
  "align-center": AlignCenter,
  bone: Bone,
  syringe: Syringe,
};

export function SpecialtiesSection({ specialties }: { specialties: Specialty[] }) {
  return (
    <section id="servicios" className="relative py-20 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-primary-light font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Nuestros servicios
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4 tracking-tight text-balance">
            Atención dental integral
          </h2>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            Cubrimos todas las áreas de la salud bucal con especialistas dedicados
            a cada disciplina.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {specialties.map((s, idx) => {
            const Icon = ICONS[s.icon || ""] || Shield;
            const isFeatured = idx === 0;
            return (
              <div
                key={s.id}
                className={[
                  "group relative rounded-3xl p-7 border transition-all duration-300 overflow-hidden",
                  isFeatured
                    ? "bg-primary-dark text-white border-primary"
                    : "bg-white border-border hover:border-primary hover:shadow-xl hover:shadow-primary/5",
                ].join(" ")}
              >
                {isFeatured && (
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl" aria-hidden />
                )}

                <div
                  className={[
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all",
                    isFeatured
                      ? "bg-white/15 backdrop-blur-sm"
                      : "bg-bg-soft-blue group-hover:bg-primary group-hover:scale-110",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "w-7 h-7 transition-colors",
                      isFeatured ? "text-white" : "text-primary group-hover:text-white",
                    ].join(" ")}
                  />
                </div>

                <h3
                  className={[
                    "text-xl font-bold mb-3 tracking-tight",
                    isFeatured ? "text-white" : "text-text-primary",
                  ].join(" ")}
                >
                  {s.name}
                </h3>
                <p
                  className={[
                    "text-sm leading-relaxed mb-5",
                    isFeatured ? "text-white/80" : "text-text-secondary",
                  ].join(" ")}
                >
                  {s.description}
                </p>

                <div
                  className={[
                    "inline-flex items-center gap-1.5 text-sm font-semibold transition-all",
                    isFeatured
                      ? "text-white"
                      : "text-primary group-hover:gap-2.5",
                  ].join(" ")}
                >
                  Conoce más
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
