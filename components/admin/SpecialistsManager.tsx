"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, Trash2, Plus, Loader2, X, User, Calendar, CheckCircle2, Key, KeyRound, UserPlus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Specialty, SpecialistWithSpecialties } from "@/lib/types";

type Credentials = { email: string | null };

type Props = {
  specialists: SpecialistWithSpecialties[];
  specialties: Specialty[];
  dentalCenterId: string;
  credentialsMap?: Record<string, Credentials>;
};

export function SpecialistsManager({ specialists, specialties, dentalCenterId, credentialsMap = {} }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SpecialistWithSpecialties | null>(null);
  const [saving, setSaving] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [credModalSpecialist, setCredModalSpecialist] = useState<SpecialistWithSpecialties | null>(null);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    photo_url: "",
    phone: "",
    email: "",
    specialtyIds: [] as string[],
  });

  useEffect(() => {
    const success = searchParams.get("gc_success");
    const error = searchParams.get("gc_error");
    if (success) {
      setBanner({ type: "success", text: "Google Calendar conectado correctamente" });
      router.replace("/admin/especialistas");
    } else if (error) {
      const messages: Record<string, string> = {
        no_config: "Faltan credenciales de Google en el servidor",
        no_refresh_token: "No se obtuvo permiso de acceso. Reintenta y autoriza todos los permisos",
        missing_params: "Parámetros incompletos",
        access_denied: "Acceso denegado por el usuario",
        db: "Error guardando en la base de datos",
        exchange: "Error al intercambiar el código de autorización",
      };
      setBanner({ type: "error", text: messages[error] || `Error: ${error}` });
      router.replace("/admin/especialistas");
    }
  }, [searchParams, router]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", title: "", description: "", photo_url: "", phone: "", email: "", specialtyIds: [] });
    setShowModal(true);
  }

  function openEdit(s: SpecialistWithSpecialties) {
    setEditing(s);
    setForm({
      name: s.name,
      title: s.title || "",
      description: s.description || "",
      photo_url: s.photo_url || "",
      phone: s.phone || "",
      email: s.email || "",
      specialtyIds: s.specialties.map((sp) => sp.id),
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const slug = form.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    try {
      let specialistId: string;

      if (editing) {
        const { error } = await supabase
          .from("specialists")
          .update({
            name: form.name,
            title: form.title || null,
            description: form.description || null,
            photo_url: form.photo_url || null,
            phone: form.phone || null,
            email: form.email || null,
          })
          .eq("id", editing.id);
        if (error) throw error;
        specialistId = editing.id;

        await supabase.from("specialist_specialties").delete().eq("specialist_id", specialistId);
      } else {
        const { data, error } = await supabase
          .from("specialists")
          .insert({
            dental_center_id: dentalCenterId,
            name: form.name,
            slug,
            title: form.title || null,
            description: form.description || null,
            photo_url: form.photo_url || null,
            phone: form.phone || null,
            email: form.email || null,
            sort_order: specialists.length,
          })
          .select()
          .single();
        if (error || !data) throw error;
        specialistId = data.id;
      }

      if (form.specialtyIds.length > 0) {
        await supabase.from("specialist_specialties").insert(
          form.specialtyIds.map((sid) => ({
            specialist_id: specialistId,
            specialty_id: sid,
          }))
        );
      }

      setShowModal(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este especialista?")) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("specialists").delete().eq("id", id);
    router.refresh();
  }

  function handleConnectCalendar(id: string) {
    window.location.href = `/api/google-calendar/authorize?specialistId=${id}`;
  }

  async function handleDisconnectCalendar(id: string) {
    if (!confirm("¿Desconectar el Google Calendar de este especialista? Las citas futuras no se sincronizarán.")) return;
    setDisconnectingId(id);
    try {
      const res = await fetch("/api/google-calendar/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialistId: id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Error al desconectar");
      }
      setBanner({ type: "success", text: "Google Calendar desconectado" });
      router.refresh();
    } catch (err) {
      console.error(err);
      setBanner({ type: "error", text: err instanceof Error ? err.message : "Error al desconectar" });
    } finally {
      setDisconnectingId(null);
    }
  }

  function toggleSpecialty(id: string) {
    setForm((f) => ({
      ...f,
      specialtyIds: f.specialtyIds.includes(id)
        ? f.specialtyIds.filter((x) => x !== id)
        : [...f.specialtyIds, id],
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Especialistas</h1>
          <p className="text-text-secondary text-sm">Gestiona el equipo de profesionales</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      {banner && (
        <div
          className={`rounded-xl px-4 py-3 text-sm flex items-start justify-between gap-3 ${
            banner.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <span>{banner.text}</span>
          <button onClick={() => setBanner(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialists.map((s) => {
          const isConnected = Boolean(s.google_refresh_token && s.calendar_id);
          const creds = credentialsMap[s.id];
          const hasCredentials = Boolean(creds?.email);
          return (
            <div key={s.id} className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-bg-soft-blue overflow-hidden shrink-0 flex items-center justify-center">
                  {s.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-text-primary truncate">{s.name}</h3>
                  <p className="text-xs text-primary truncate">{s.title}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {s.specialties.map((sp) => (
                  <span key={sp.id} className="text-[10px] uppercase font-semibold bg-bg-soft-blue text-primary px-2 py-0.5 rounded-full">
                    {sp.name}
                  </span>
                ))}
              </div>

              <div className="mb-3 space-y-2">
                <button
                  onClick={() => setCredModalSpecialist(s)}
                  className={`w-full inline-flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                    hasCredentials
                      ? "text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
                      : "text-text-secondary bg-bg-secondary hover:bg-bg-soft-blue hover:text-primary"
                  }`}
                >
                  {hasCredentials ? (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      Acceso: {creds?.email}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Crear acceso al portal
                    </>
                  )}
                </button>
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnectCalendar(s.id)}
                    disabled={disconnectingId === s.id}
                    className="w-full inline-flex items-center justify-center gap-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {disconnectingId === s.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    Google Calendar conectado · Desconectar
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnectCalendar(s.id)}
                    className="w-full inline-flex items-center justify-center gap-2 text-xs font-medium text-text-secondary bg-bg-secondary hover:bg-bg-soft-blue hover:text-primary px-3 py-2 rounded-lg transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Conectar Google Calendar
                  </button>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-border-light">
                <button
                  onClick={() => openEdit(s)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm text-text-secondary hover:text-primary py-2 rounded-lg hover:bg-bg-secondary transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm text-error hover:text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {credModalSpecialist && (
        <CredentialsModal
          specialist={credModalSpecialist}
          existingEmail={credentialsMap[credModalSpecialist.id]?.email || null}
          onClose={() => setCredModalSpecialist(null)}
          onChanged={(msg) => {
            setBanner({ type: "success", text: msg });
            setCredModalSpecialist(null);
            router.refresh();
          }}
          onError={(msg) => setBanner({ type: "error", text: msg })}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">
                {editing ? "Editar especialista" : "Nuevo especialista"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-bg-secondary rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Nombre completo *">
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
                  placeholder="Ej: Especialista en Endodoncia"
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
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Teléfono">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input"
                  />
                </Field>
              </div>
              <Field label="Especialidades">
                <div className="space-y-1.5">
                  {specialties.map((sp) => (
                    <label key={sp.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.specialtyIds.includes(sp.id)}
                        onChange={() => toggleSpecialty(sp.id)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm">{sp.name}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-text-secondary rounded-xl hover:bg-bg-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
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

function CredentialsModal({
  specialist,
  existingEmail,
  onClose,
  onChanged,
  onError,
}: {
  specialist: SpecialistWithSpecialties;
  existingEmail: string | null;
  onClose: () => void;
  onChanged: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [email, setEmail] = useState(existingEmail || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!email || !password) {
      onError("Email y contraseña son obligatorios");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/specialist-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialistId: specialist.id, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Error");
      }
      onChanged(`Acceso creado para ${specialist.name}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!password) {
      onError("Ingresa la nueva contraseña");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/specialist-credentials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialistId: specialist.id, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Error");
      }
      onChanged(`Contraseña actualizada para ${specialist.name}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Quitar el acceso al portal de ${specialist.name}? El usuario no podrá iniciar sesión.`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/specialist-credentials", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialistId: specialist.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Error");
      }
      onChanged(`Acceso eliminado para ${specialist.name}`);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            {existingEmail ? "Gestionar acceso" : "Crear acceso al portal"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-bg-secondary rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-text-secondary">
            Especialista: <strong className="text-text-primary">{specialist.name}</strong>
          </p>
          <Field label="Email de acceso">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={Boolean(existingEmail)}
              className="input disabled:bg-bg-secondary disabled:text-text-muted"
            />
          </Field>
          <Field label={existingEmail ? "Nueva contraseña (mín. 6 caracteres)" : "Contraseña (mín. 6 caracteres)"}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              autoComplete="new-password"
            />
          </Field>
        </div>
        <div className="p-6 border-t border-border flex justify-between gap-2">
          <div>
            {existingEmail && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex items-center gap-2 text-sm text-error hover:bg-red-50 px-3 py-2 rounded-xl disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Quitar acceso
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-text-secondary rounded-xl hover:bg-bg-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={existingEmail ? handleResetPassword : handleCreate}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              {existingEmail ? "Actualizar contraseña" : "Crear acceso"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
