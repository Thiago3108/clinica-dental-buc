import { Users, Award, Calendar, Smile } from "lucide-react";

const STATS = [
  {
    icon: Users,
    value: "+500",
    label: "Pacientes atendidos",
  },
  {
    icon: Award,
    value: "5",
    label: "Especialidades",
  },
  {
    icon: Calendar,
    value: "+8 años",
    label: "De experiencia",
  },
  {
    icon: Smile,
    value: "4.9/5",
    label: "Satisfacción promedio",
  },
];

export function StatsSection() {
  return (
    <section className="relative bg-bg-navy text-white py-12 sm:py-16 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary-light/10 blur-3xl rounded-full" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="text-center sm:text-left flex flex-col sm:flex-row items-center gap-3 sm:gap-4"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold leading-none tracking-tight">
                    {s.value}
                  </p>
                  <p className="text-xs sm:text-sm text-white/70 mt-1.5">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
