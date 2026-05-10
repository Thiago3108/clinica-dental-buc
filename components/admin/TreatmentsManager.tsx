"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Loader2, X, Clock } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Specialty, Treatment } from "@/lib/types";

type Props = {
  treatments: Treatment[];
  specialties: Specialty[];
  dentalCenterId: string;
};

export function TreatmentsManager({ treatments, specialties, dentalCenterId }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Treatment | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all");
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration_minutes: 30,
    price: "",
    specialty_id: "",
  });

  const filtered = filterSpecialty === "all"
    ? treatments
    : treatments.filter((t) => t.specialty_id === filterSpecialty);

  function openCreate() {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      duration_minutes: 30,
      price: "",
      specialty_id: specialties[0]?.id || "",
    });
    setShowModal(true);
  }

  function openEdit(t: Treatment) {
    setEditing(t);
    setForm({
      name: t.name,
      description: t.description || "",
      duration_minutes: t.duration_minutes,
      price: t.price ? String(t.price) : "",
      specialty_id: t.specialty_id,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.specialty_id) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        duration_minutes: form.duration_minutes,
        price: form.price ? parseFloat(form.price) : null,
        specialty_id: form.specialty_id,
      };

      if (editing) {
        await supabase.from("treatments").update(payload).eq("id", editing.id);
      } else {
        await supabase.from("treatments").insert({
          ...payload,
          dental_center_id: dentalCenterId,
          sort_order: treatments.filter((t) => t.specialty_id === form.specialty_id).length,
        });
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
    if (!confirm("¿Eliminar este tratamiento?")) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("treatments").update({ is_active: false }).eq("id", id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Tratamientos</h1>
          <p className="text-text-secondary text-sm">Gestiona los servicios disponibles</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Agregar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterSpecialty("all")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filterSpecialty === "all"
              ? "bg-primary text-white"
              : "bg-white border border-border text-text-secondary hover:border-primary"
          }`}
        >
          Todas
        </button>
        {specialties.map((sp) => (
          <button
            key={sp.id}
            onClick={() => setFilterSpecialty(sp.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterSpecialty === sp.id
                ? "bg-primary text-white"
                : "bg-white border border-border text-text-secondary hover:border-primary"
            }`}
          >
            {sp.name}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-2xl divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-text-muted">No hay tratamientos</div>
        ) : (
          filtered.map((t) => {
            const specialty = specialties.find((s) => s.id === t.specialty_id);
            return (
              <div key={t.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-bg-secondary transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-text-primary">{t.name}</h3>
                    {specialty && (
                      <span className="text-[10px] uppercase font-semibold bg-bg-soft-blue text-primary px-2 py-0.5 rounded-full">
                        {specialty.name}
                      </span>
                    )}
                  </div>
                  {t.description && (
                    <p className="text-sm text-text-secondary line-clamp-1">{t.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="inline-flex items-center gap-1 text-text-secondary">
                      <Clock className="w-3.5 h-3.5" />
                      {t.duration_minutes} min
                    </span>
                    {t.price !== null && t.price > 0 && (
                      <span className="font-semibold text-primary">
                        ${Number(t.price).toLocaleString("es-CO")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(t)} className="p-2 hover:bg-bg-tertiary rounded-lg">
                    <Pencil className="w-4 h-4 text-text-secondary" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-error" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">
                {editing ? "Editar tratamiento" : "Nuevo tratamiento"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-bg-secondary rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Especialidad *</label>
                <select
                  value={form.specialty_id}
                  onChange={(e) => setForm({ ...form, specialty_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
                  <option value="">Selecciona una especialidad</option>
                  {specialties.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Duración (min) *</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={form.duration_minutes}
                    onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">Precio (COP)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="Opcional"
                    className="w-full px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>
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
                disabled={saving || !form.name.trim() || !form.specialty_id}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
