import { MapPin, Phone, Mail, Instagram, ExternalLink, Clock, MessageCircle } from "lucide-react";
import type { DentalCenter } from "@/lib/types";
import type { WeeklyHour } from "@/lib/business-hours";
import { groupConsecutiveHours } from "@/lib/business-hours";

const FULL_MAPS_URL =
  "https://www.google.com/maps/place/Dr+Jhonny+Contreras/@7.1124369,-73.1140894,17z/data=!4m6!3m5!1s0x8e683fceeb93197d:0x3c479dd9fde73073!8m2!3d7.1124369!4d-73.1115091!16s%2Fg%2F11y3qb6mhq";

type Props = {
  center: DentalCenter;
  weeklyHours?: WeeklyHour[];
};

function buildScheduleRows(weeklyHours?: WeeklyHour[]) {
  if (!weeklyHours || weeklyHours.length === 0) {
    return [
      { day: "Lunes - Viernes", hours: "8:00 AM - 7:00 PM" },
      { day: "Sábado", hours: "8:00 AM - 2:00 PM" },
      { day: "Domingo", hours: "Cerrado", closed: true },
    ];
  }

  const grouped = groupConsecutiveHours(weeklyHours);
  return grouped.map((item) => ({
    day: item.label,
    hours: item.hours,
    closed: item.closed,
  }));
}

export function LocationSection({ center, weeklyHours }: Props) {
  const waPhone = (center.whatsapp || center.phone || "").replace(/\D/g, "");
  const waUrl = waPhone
    ? `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(
        `Hola, me gustaría agendar una cita en ${center.name}.`,
      )}`
    : null;
  const scheduleRows = buildScheduleRows(weeklyHours);

  return (
    <section id="ubicacion" className="py-20 sm:py-24 bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-primary-light font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Visítanos
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4 tracking-tight text-balance">
            Estamos para atenderte
          </h2>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            Encuéntranos fácilmente o contáctanos por el medio que prefieras
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Mapa */}
          <div className="lg:col-span-3 rounded-3xl overflow-hidden border border-border min-h-100 lg:min-h-130 bg-white shadow-sm">
            {center.google_maps_url ? (
              <iframe
                src={center.google_maps_url}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 400 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Clínica Dental Buc"
              />
            ) : (
              <div className="w-full h-full min-h-100 flex items-center justify-center bg-bg-soft-blue/40">
                <MapPin className="w-16 h-16 text-primary/30" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Horarios destacados */}
            <div className="bg-linear-to-br from-primary to-primary-dark text-white rounded-3xl p-6 shadow-xl shadow-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" />
                <h3 className="font-bold text-lg">Horario de atención</h3>
              </div>
              <ul className="space-y-2.5">
                {scheduleRows.map((s, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between pb-2.5 border-b border-white/15 last:border-0 last:pb-0"
                  >
                    <span className="text-sm text-white/85">{s.day}</span>
                    <span
                      className={[
                        "text-sm font-semibold",
                        s.closed ? "text-red-300" : "text-white",
                      ].join(" ")}
                    >
                      {s.hours}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dirección */}
            {center.address && (
              <div className="bg-white rounded-2xl p-5 border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bg-soft-blue flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary mb-1 text-sm">Dirección</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{center.address}</p>
                    <a
                      href={FULL_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary hover:underline"
                    >
                      Cómo llegar
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Contacto grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {center.phone && (
                <a
                  href={`tel:${center.phone}`}
                  className="bg-white rounded-2xl p-4 border border-border hover:border-primary hover:shadow-md transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-bg-soft-blue flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-text-muted uppercase tracking-wide">Teléfono</p>
                    <p className="text-sm font-semibold text-text-primary truncate">{center.phone}</p>
                  </div>
                </a>
              )}
              {center.email && (
                <a
                  href={`mailto:${center.email}`}
                  className="bg-white rounded-2xl p-4 border border-border hover:border-primary hover:shadow-md transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-bg-soft-blue flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-text-muted uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-text-primary truncate">{center.email}</p>
                  </div>
                </a>
              )}
              {center.instagram && (
                <a
                  href={`https://instagram.com/${center.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl p-4 border border-border hover:border-primary hover:shadow-md transition-all flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-bg-soft-blue flex items-center justify-center shrink-0">
                    <Instagram className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-text-muted uppercase tracking-wide">Instagram</p>
                    <p className="text-sm font-semibold text-text-primary truncate">@{center.instagram}</p>
                  </div>
                </a>
              )}
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-whatsapp hover:bg-[#1ebe57] text-white rounded-2xl p-4 transition-all flex items-center gap-3 shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" fill="currentColor" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-white/80 uppercase tracking-wide">Chat</p>
                    <p className="text-sm font-semibold">WhatsApp</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
