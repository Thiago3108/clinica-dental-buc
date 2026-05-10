"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Save } from "lucide-react";
import type { Specialist } from "@/lib/types";

type Props = {
  specialist: Specialist;
  userEmail: string | null;
};

export function SpecialistProfileForm({ specialist, userEmail }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    name: specialist.name,
    title: specialist.title || "",
    description: specialist.description || "",
    photo_url: specialist.photo_url || "",
    phone: specialist.phone || "",
    email: specialist.email || "",
  });

  // Cambio de contraseña
  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    setBanner(null);
    try {
      const res = await fetch("/api/especialista/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Error al guardar");
      }
      setBanner({ type: "success", text: "Perfil actualizado correctamente" });
      router.refresh();
    } catch (err) {
      setBanner({ type: "error", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange() {
    if (pwdForm.next !== pwdForm.confirm) {
      setBanner({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }
    if (pwdForm.next.length < 6) {
      setBanner({ type: "error", text: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }
    setPwdSaving(true);
    setBanner(null);
    try {
      const res = await fetch("/api/especialista/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwdForm.next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Error al cambiar contraseña");
      }
      setBanner({ type: "success", text: "Contraseña cambiada correctamente" });
      setPwdForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setBanner({ type: "error", text: err instanceof Error ? err.message : "Error" });
    } finally {
      setPwdSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Mi perfil</h1>
        <p className="text-text-secondary text-sm">Edita tu información personal</p>
      </div>

      {banner && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            banner.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {banner.text}
        </div>
      )}

      <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-bg-soft-blue overflow-hidden shrink-0 flex items-center justify-center">
            {form.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.photo_url} alt={form.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-text-primary truncate">{form.name}</p>
            <p className="text-xs text-text-secondary truncate">{userEmail}</p>
          </div>
        </div>

        <Field label="Nombre completo">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Título / Especialización">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
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
        <Field label="URL de foto">
          <input
            type="url"
            value={form.photo_url}
            onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
            className="input"
            placeholder="https://..."
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Teléfono">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Email de contacto">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
          </Field>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar cambios
          </button>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="font-bold text-text-primary">Cambiar contraseña</h2>
          <p className="text-xs text-text-secondary">Mínimo 6 caracteres</p>
        </div>
        <Field label="Nueva contraseña">
          <input
            type="password"
            value={pwdForm.next}
            onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="Confirmar contraseña">
          <input
            type="password"
            value={pwdForm.confirm}
            onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
            className="input"
          />
        </Field>
        <div className="flex justify-end">
          <button
            onClick={handlePasswordChange}
            disabled={pwdSaving || !pwdForm.next}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {pwdSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Cambiar contraseña
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
