"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Instagram, Menu, X } from "lucide-react";
import type { DentalCenter } from "@/lib/types";

const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#equipo", label: "Equipo" },
  { href: "#galeria", label: "Galería" },
  { href: "#ubicacion", label: "Ubicación" },
];

const INSTAGRAM_URL = "https://www.instagram.com/dr.jhonnycontreras/";

export function PublicHeader({ center }: { center: DentalCenter }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-white/60 backdrop-blur-sm border-b border-transparent",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link
          href={`/clinica/${center.slug}`}
          className="flex items-center gap-3 group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/logo/logo.png"
            alt={center.name}
            className="w-11 h-11 rounded-xl object-contain bg-white border border-border shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="leading-tight">
            <p className="font-bold text-text-primary text-[15px]">Dr. Jonny Contreras</p>
            <p className="text-[11px] text-text-muted">Especialistas dentales</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary transition-colors"
          >
            <Instagram className="w-4 h-4" />
            Instagram
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={`/clinica/${center.slug}/agendar`}
            className="hidden sm:inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm shadow-primary/20"
          >
            <Calendar className="w-4 h-4" />
            Agenda tu cita
          </Link>
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-lg border border-border bg-white text-text-primary"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-3 rounded-lg text-text-primary hover:bg-bg-soft-blue transition-colors text-sm font-medium"
              >
                {l.label}
              </a>
            ))}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-1 px-3 py-3 rounded-lg inline-flex items-center gap-2 text-text-primary hover:bg-bg-soft-blue transition-colors text-sm font-medium"
            >
              <Instagram className="w-4 h-4" />
              Instagram
            </a>
            <Link
              href={`/clinica/${center.slug}/agendar`}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-3 rounded-lg"
            >
              <Calendar className="w-4 h-4" />
              Agenda tu cita
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
