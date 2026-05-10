"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, ExternalLink, Copy } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DentalCenter } from "@/lib/types";

export function SettingsForm({ center }: { center: DentalCenter }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: center.name,
    description: center.description || "",
    phone: center.phone || "",
    whatsapp: center.whatsapp || "",
    email: center.email || "",
    address: center.address || "",
    instagram: center.instagram || "",
    google_maps_url: center.google_maps_url || "",
  });

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/clinica/${center.slug}`
    : "";

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
      .from("dental_centers")
      .update(form)
      .eq("id", center.id);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    }
    setSaving(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Configuración</h1>
        <p className="text-text-secondary text-sm">Ajustes generales de la clínica</p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6">
        <h2 className="font-bold text-text-primary mb-1">Enlace público de reservas</h2>
        <p className="text-sm text-text-secondary mb-4">
          Comparte este enlace con tus pacientes para que puedan agendar citas
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={publicUrl}
            readOnly
            className="flex-1 px-3.5 py-2.5 bg-bg-secondary border border-border rounded-xl text-sm font-mono"
          />
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-bg-secondary hover:bg-bg-tertiary border border-border rounded-xl text-sm font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir
          </a>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-text-primary">Información de la clínica</h2>

        <Field label="Nombre de la clínica">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="Descripción">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="input resize-none"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Teléfono">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="WhatsApp">
            <input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Instagram (sin @)">
            <input
              type="text"
              value={form.instagram}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <Field label="Dirección">
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="input"
          />
        </Field>

        <Field label="URL de Google Maps (embed)">
          <input
            type="url"
            value={form.google_maps_url}
            onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
            placeholder="https://www.google.com/maps/embed?..."
            className="input"
          />
        </Field>

        <div className="flex justify-end pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saved && <Check className="w-4 h-4" />}
            {saved ? "Guardado" : "Guardar cambios"}
          </button>
        </div>
      </div>
      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 10px 14px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.15s;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #1e6db5;
          box-shadow: 0 0 0 4px rgba(30, 109, 181, 0.1);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      {children}
    </div>
  );
}
