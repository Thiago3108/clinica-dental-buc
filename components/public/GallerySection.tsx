"use client";

import { useState } from "react";
import { Sparkles, AlignCenter, Bluetooth, Syringe, Smile, ImageIcon } from "lucide-react";

type Category = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  /** Rutas completas a las imágenes de esta categoría. */
  images: string[];
};

const CATEGORIES: Category[] = [
  {
    key: "implantes",
    label: "Implantes",
    icon: Syringe,
    description: "Reemplazo de dientes con implantes de titanio biocompatible",
    images: ["/img/servicios/implantes/image.png"],
  },
  {
    key: "ortodoncia",
    label: "Ortodoncia",
    icon: AlignCenter,
    description: "Corrección de la posición de los dientes",
    images: ["/img/servicios/ortodoncia/image.png"],
  },
  {
    key: "estetica",
    label: "Estética",
    icon: Sparkles,
    description: "Carillas, blanqueamiento y restauraciones",
    images: [
      "/img/servicios/estetica/image.png",
      "/img/servicios/estetica/image2.png",
    ],
  },
  {
    key: "endodoncia",
    label: "Endodoncia",
    icon: Bluetooth,
    description: "Tratamientos de conducto con tecnología avanzada",
    images: ["/img/servicios/endodoncia/image.png"],
  },
  {
    key: "diseno",
    label: "Diseño de sonrisa",
    icon: Smile,
    description: "Transformaciones completas y personalizadas",
    images: ["/img/servicios/diseno/image.png"],
  },
];

export function GallerySection() {
  const [activeKey, setActiveKey] = useState(CATEGORIES[0].key);
  const active = CATEGORIES.find((c) => c.key === activeKey) || CATEGORIES[0];
  const ActiveIcon = active.icon;

  return (
    <section id="galeria" className="py-20 sm:py-24 bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-primary-light font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Casos reales
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4 tracking-tight text-balance">
            Algunos de nuestros trabajos
          </h2>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            Resultados reales de nuestros pacientes en cada especialidad
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = cat.key === activeKey;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveKey(cat.key)}
                className={[
                  "inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-sm font-semibold transition-all",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                    : "bg-white text-text-secondary border border-border hover:border-primary hover:text-primary",
                ].join(" ")}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Category header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <ActiveIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary">{active.label}</h3>
            <p className="text-sm text-text-secondary">{active.description}</p>
          </div>
        </div>

        {/* Grid */}
        {active.images.length > 0 ? (
          <div
            className={[
              "grid gap-3 sm:gap-4 animate-fade-in",
              active.images.length === 1
                ? "grid-cols-1 max-w-2xl mx-auto"
                : active.images.length === 2
                  ? "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
            ].join(" ")}
          >
            {active.images.map((src, idx) => (
              <div
                key={`${activeKey}-${idx}`}
                className={[
                  "rounded-2xl overflow-hidden bg-white border border-border relative group hover:shadow-xl transition-all",
                  active.images.length <= 2 ? "aspect-[4/3]" : "aspect-square",
                ].join(" ")}
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-text-muted/40 -z-0 pointer-events-none">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-muted">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Próximamente más casos</p>
          </div>
        )}

        <p className="text-center text-xs text-text-muted mt-8">
          Para agregar más imágenes a una categoría, edita el array{" "}
          <code className="bg-white px-1.5 py-0.5 rounded">images</code> en{" "}
          <code className="bg-white px-1.5 py-0.5 rounded">
            components/public/GallerySection.tsx
          </code>
        </p>
      </div>
    </section>
  );
}
