import { Stethoscope, Instagram, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import type { DentalCenter } from "@/lib/types";

const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#equipo", label: "Equipo" },
  { href: "#galeria", label: "Galería" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#ubicacion", label: "Ubicación" },
];

export function PublicFooter({ center }: { center: DentalCenter }) {
  const waPhone = (center.whatsapp || center.phone || "").replace(/\D/g, "");
  const waUrl = waPhone
    ? `https://api.whatsapp.com/send?phone=${waPhone}`
    : null;

  return (
    <footer className="relative bg-bg-navy text-white pt-16 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" aria-hidden />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary-light/10 blur-3xl rounded-full" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-bold text-lg">{center.name}</p>
                <p className="text-xs text-white/60">Especialistas en salud bucal</p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-md">
              {center.description ||
                "Atención dental integral con tecnología avanzada y especialistas certificados. Tu sonrisa en las mejores manos."}
            </p>

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-5 bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" fill="currentColor" />
                Escríbenos por WhatsApp
              </a>
            )}
          </div>

          {/* Navegación */}
          <div className="md:col-span-3">
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white/80">
              Navegación
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="text-sm text-white/70 hover:text-accent transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="md:col-span-4">
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-white/80">
              Contacto
            </h4>
            <ul className="space-y-3">
              {center.address && (
                <li className="flex items-start gap-3 text-sm text-white/70">
                  <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{center.address}</span>
                </li>
              )}
              {center.phone && (
                <li>
                  <a
                    href={`tel:${center.phone}`}
                    className="flex items-center gap-3 text-sm text-white/70 hover:text-accent transition-colors"
                  >
                    <Phone className="w-4 h-4 text-accent shrink-0" />
                    {center.phone}
                  </a>
                </li>
              )}
              {center.email && (
                <li>
                  <a
                    href={`mailto:${center.email}`}
                    className="flex items-center gap-3 text-sm text-white/70 hover:text-accent transition-colors break-all"
                  >
                    <Mail className="w-4 h-4 text-accent shrink-0" />
                    {center.email}
                  </a>
                </li>
              )}
              {center.instagram && (
                <li>
                  <a
                    href={`https://instagram.com/${center.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-white/70 hover:text-accent transition-colors"
                  >
                    <Instagram className="w-4 h-4 text-accent shrink-0" />@{center.instagram}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {center.name}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/40">
            Diseñado para el cuidado de tu sonrisa
          </p>
        </div>
      </div>
    </footer>
  );
}
