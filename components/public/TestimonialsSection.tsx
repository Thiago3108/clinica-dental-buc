import { Quote, Star, Play, Instagram } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  text: string;
  rating: number;
  photo: string;
  /** Si se provee, muestra ícono de play y enlace al reel de Instagram */
  instagramReel?: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "María González",
    role: "Paciente de Ortodoncia",
    text: "Excelente atención de principio a fin. Me siento muy contenta con los resultados de mi tratamiento y el seguimiento que me dieron en cada cita.",
    rating: 5,
    photo: "/img/testimonios/1.jpg",
    // instagramReel: "https://www.instagram.com/reel/XXXXXXX/",
  },
  {
    name: "Carlos Rodríguez",
    role: "Paciente de Implantes",
    text: "Profesionalismo de primer nivel. Recuperé mi sonrisa gracias al equipo de la clínica. El proceso fue claro, sin dolor y los resultados son increíbles.",
    rating: 5,
    photo: "/img/testimonios/2.jpg",
  },
  {
    name: "Andrea Pérez",
    role: "Paciente de Estética",
    text: "El diseño de sonrisa cambió mi vida. Increíble experiencia de principio a fin. Recomiendo totalmente al equipo, son muy detallistas.",
    rating: 5,
    photo: "/img/testimonios/3.jpg",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonios" className="relative py-20 sm:py-24 bg-white overflow-hidden">
      {/* Decoración */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" aria-hidden />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-primary-light font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Testimonios
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4 tracking-tight text-balance">
            Lo que dicen nuestros pacientes
          </h2>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            Historias reales de personas que confiaron en nosotros para transformar su sonrisa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <article
              key={idx}
              className="group relative bg-gradient-to-br from-bg-soft-blue/50 to-white border border-border rounded-3xl p-7 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
            >
              <Quote className="w-10 h-10 text-primary/20 mb-4" />

              <p className="text-text-primary leading-relaxed mb-5 text-[15px]">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-500" fill="currentColor" />
                ))}
              </div>

              <div className="flex items-center gap-3 pt-5 border-t border-border-light">
                <div
                  className="w-12 h-12 rounded-full bg-bg-soft-blue overflow-hidden shrink-0 ring-2 ring-white shadow-md"
                  style={{
                    backgroundImage: `url(${t.photo})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-primary text-sm">{t.name}</p>
                  <p className="text-xs text-text-secondary">{t.role}</p>
                </div>

                {t.instagramReel && (
                  <a
                    href={t.instagramReel}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Ver testimonio en Instagram"
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform"
                  >
                    <Play className="w-4 h-4" fill="currentColor" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Footer hint para reels */}
        <div className="mt-10 text-center">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
          >
            <Instagram className="w-4 h-4" />
            Mira más testimonios en nuestro Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
