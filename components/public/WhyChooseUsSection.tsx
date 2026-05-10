import { Microscope, GraduationCap, HeartHandshake, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Microscope,
    title: "Tecnología de última generación",
    description:
      "Diagnóstico digital, escáneres intraorales y equipos de imagenología que permiten precisión en cada tratamiento.",
  },
  {
    icon: GraduationCap,
    title: "Especialistas certificados",
    description:
      "Nuestro equipo cuenta con formación de posgrado y actualización continua en cada área de la odontología.",
  },
  {
    icon: HeartHandshake,
    title: "Atención personalizada",
    description:
      "Cada paciente es único. Diseñamos planes de tratamiento a medida con seguimiento constante.",
  },
  {
    icon: ShieldCheck,
    title: "Bioseguridad garantizada",
    description:
      "Protocolos estrictos de esterilización y materiales certificados que aseguran tu bienestar en cada visita.",
  },
];

export function WhyChooseUsSection() {
  return (
    <section className="relative py-20 sm:py-24 bg-bg-soft-blue/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <p className="text-primary-light font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              ¿Por qué elegirnos?
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-5 tracking-tight text-balance leading-tight">
              Más que un consultorio,
              <span className="text-primary"> un equipo que te acompaña</span>
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Comprometidos con tu salud bucal y con resultados que duran.
              Estos son los pilares de nuestra práctica.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {FEATURES.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-4 shadow-md shadow-primary/20">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-text-primary mb-2 text-[17px]">
                    {f.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
