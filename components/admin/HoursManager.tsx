"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Specialist, WorkingHour, Break } from "@/lib/types";

const DAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
];

type Props = {
  specialists: Specialist[];
  workingHours: WorkingHour[];
  breaks: Break[];
};

export function HoursManager({ specialists, workingHours, breaks }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(specialists[0]?.id || "");
  const [saving, setSaving] = useState<number | null>(null);

  const specialistHours = workingHours.filter((h) => h.specialist_id === selectedId);
  const specialistBreaks = breaks.filter((b) => b.specialist_id === selectedId);

  async function updateHours(dayOfWeek: number, updates: Partial<WorkingHour>) {
    setSaving(dayOfWeek);
    const supabase = createSupabaseBrowserClient();
    const existing = specialistHours.find((h) => h.day_of_week === dayOfWeek);

    if (existing) {
      await supabase
        .from("specialist_working_hours")
        .update(updates)
        .eq("id", existing.id);
    } else {
      await supabase.from("specialist_working_hours").insert({
        specialist_id: selectedId,
        day_of_week: dayOfWeek,
        start_time: "08:00",
        end_time: "18:00",
        is_active: true,
        ...updates,
      });
    }

    router.refresh();
    setSaving(null);
  }

  async function updateBreak(dayOfWeek: number, updates: Partial<Break>) {
    const supabase = createSupabaseBrowserClient();
    const existing = specialistBreaks.find((b) => b.day_of_week === dayOfWeek);

    if (existing) {
      await supabase.from("specialist_breaks").update(updates).eq("id", existing.id);
    } else {
      await supabase.from("specialist_breaks").insert({
        specialist_id: selectedId,
        day_of_week: dayOfWeek,
        start_time: "12:00",
        end_time: "14:00",
        is_active: true,
        ...updates,
      });
    }

    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Horarios</h1>
        <p className="text-text-secondary text-sm">Configura los horarios de atención de cada especialista</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Especialista</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full max-w-md px-3.5 py-2.5 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
          {specialists.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-border rounded-2xl divide-y divide-border">
        {DAYS.map((day) => {
          const hours = specialistHours.find((h) => h.day_of_week === day.value);
          const dayBreak = specialistBreaks.find((b) => b.day_of_week === day.value);
          const isActive = hours?.is_active ?? false;

          return (
            <div key={day.value} className="p-4 sm:p-5">
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => updateHours(day.value, { is_active: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="font-medium text-text-primary w-24">{day.label}</span>
                </label>
                {saving === day.value && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              </div>

              {isActive && hours && (
                <div className="ml-6 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-text-secondary w-20">Horario:</span>
                    <input
                      type="time"
                      defaultValue={hours.start_time.slice(0, 5)}
                      onBlur={(e) => updateHours(day.value, { start_time: e.target.value })}
                      className="px-3 py-1.5 bg-white border border-border rounded-lg text-sm"
                    />
                    <span className="text-text-muted">—</span>
                    <input
                      type="time"
                      defaultValue={hours.end_time.slice(0, 5)}
                      onBlur={(e) => updateHours(day.value, { end_time: e.target.value })}
                      className="px-3 py-1.5 bg-white border border-border rounded-lg text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dayBreak?.is_active ?? false}
                        onChange={(e) => updateBreak(day.value, { is_active: e.target.checked })}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm text-text-secondary w-20">Descanso:</span>
                    </label>
                    {dayBreak?.is_active && (
                      <>
                        <input
                          type="time"
                          defaultValue={dayBreak.start_time.slice(0, 5)}
                          onBlur={(e) => updateBreak(day.value, { start_time: e.target.value })}
                          className="px-3 py-1.5 bg-white border border-border rounded-lg text-sm"
                        />
                        <span className="text-text-muted">—</span>
                        <input
                          type="time"
                          defaultValue={dayBreak.end_time.slice(0, 5)}
                          onBlur={(e) => updateBreak(day.value, { end_time: e.target.value })}
                          className="px-3 py-1.5 bg-white border border-border rounded-lg text-sm"
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
