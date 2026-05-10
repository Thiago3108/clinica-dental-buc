import Link from "next/link";
import { Calendar, MessageCircle, Star, ArrowRight, ShieldCheck } from "lucide-react";
import type { DentalCenter } from "@/lib/types";

export function HeroSection({ center }: { center: DentalCenter }) {
  const waPhone = (center.whatsapp || center.phone || "").replace(/\D/g, "");
  const waMessage = encodeURIComponent(
    `Hola, me gustaría agendar una cita en ${center.name}.`,
  );
  const waUrl = waPhone
    ? `https://api.whatsapp.com/send?phone=${waPhone}&text=${waMessage}`
    : null;

  return (
    <section className="relative overflow-hidden bg-bg-navy text-white">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url(/img/hero/hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary-dark/95 to-primary/80" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            "radial-gradient(circle at top left, rgba(255,255,255,0.10), transparent 34%)",
            "radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent 30%)",
            "radial-gradient(circle at bottom left, rgba(34,197,94,0.10), transparent 34%)",
            "radial-gradient(circle at bottom right, rgba(0,0,0,0.18), transparent 32%)",
          ].join(", "),
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-light/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-1.5 text-xs sm:text-sm">
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-300" fill="currentColor" />
                ))}
              </span>
              <span className="text-white/90">Más de 500 pacientes felices</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-balance">
              Tu sonrisa,
              <br />
              transformada por
              <span className="block bg-gradient-to-r from-white via-accent to-primary-light bg-clip-text text-transparent">
                especialistas
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/80 max-w-xl leading-relaxed">
              Implantes, ortodoncia, estética dental, endodoncia y diseño de sonrisa.
              Tecnología avanzada y un equipo dedicado a cuidar tu salud bucal.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-black/20 hover:scale-[1.02]"
                >
                  <MessageCircle className="w-5 h-5" fill="currentColor" />
                  Agenda por WhatsApp
                </a>
              ) : null}
              <Link
                href={`/clinica/${center.slug}/agendar`}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-bg-soft-blue text-primary-dark font-semibold px-6 py-3.5 rounded-xl transition-all"
              >
                <Calendar className="w-5 h-5" />
                Reservar online
              </Link>
              <a
                href="#servicios"
                className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 border border-white/30 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
              >
                Ver servicios
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            <div className="pt-4 flex items-center gap-6 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Especialistas certificados</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Bioseguridad garantizada</span>
              </div>
            </div>
          </div>

          {/* Right side: floating image with stats */}
          <div className="lg:col-span-5 relative">
            <div
              className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/15 shadow-2xl"
              style={{
                backgroundImage: "url(/img/hero/clinica.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              role="img"
              aria-label="Clínica Dental Buc"
            >
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 110px rgba(0,0,0,0.30), inset 0 0 28px rgba(0,0,0,0.18)",
                }}
                aria-hidden
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Floating stats card */}
            <div className="absolute -bottom-6 -left-4 sm:left-auto sm:-bottom-8 sm:-right-6 bg-white text-text-primary rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/20 border border-white/40 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-bg-soft-blue flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-500" fill="currentColor" />
                </div>
                <div>
                  <p className="font-bold text-lg leading-none">4.9/5</p>
                  <p className="text-xs text-text-secondary mt-1">Calificación promedio</p>
                </div>
              </div>
            </div>

            {/* Floating specialty card */}
            <div className="absolute -top-4 -right-2 sm:-top-6 sm:-left-6 sm:right-auto bg-primary text-white rounded-2xl px-4 py-3 shadow-2xl shadow-black/20">
              <p className="text-xs font-medium opacity-80">Especialistas</p>
              <p className="font-bold text-2xl leading-none">5+</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
