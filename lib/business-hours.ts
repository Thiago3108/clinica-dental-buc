/**
 * Helpers para calcular el horario semanal consolidado de la clínica
 * a partir de los horarios individuales de los especialistas.
 *
 * Lógica: el horario de la clínica para cada día es el rango unión
 * de todos los especialistas activos ese día (open = primer inicio,
 * close = último cierre).
 */

export type WorkingHourRow = {
  day_of_week: number; // 0 (domingo) ... 6 (sábado)
  start_time: string;  // "HH:MM:SS"
  end_time: string;    // "HH:MM:SS"
  is_active?: boolean;
};

export type WeeklyHour = {
  day: number;        // 0..6
  label: string;      // "Lunes"
  closed: boolean;
  open?: string;      // "8:00 AM"
  close?: string;     // "7:00 PM"
  range?: string;     // "8:00 AM - 7:00 PM"
};

const DAY_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

// Orden de visualización: Lunes → Domingo
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function minutesToLabel(m: number): string {
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mmStr = mm.toString().padStart(2, "0");
  return mm === 0 ? `${h12}:00 ${ampm}` : `${h12}:${mmStr} ${ampm}`;
}

/**
 * Calcula horario semanal consolidado a partir de horarios por especialista.
 */
export function computeWeeklyHours(rows: WorkingHourRow[]): WeeklyHour[] {
  const byDay = new Map<number, { min: number; max: number }>();

  for (const r of rows) {
    if (r.is_active === false) continue;
    const start = timeToMinutes(r.start_time);
    const end = timeToMinutes(r.end_time);
    const cur = byDay.get(r.day_of_week);
    if (cur) {
      cur.min = Math.min(cur.min, start);
      cur.max = Math.max(cur.max, end);
    } else {
      byDay.set(r.day_of_week, { min: start, max: end });
    }
  }

  return DISPLAY_ORDER.map((day) => {
    const range = byDay.get(day);
    if (!range) {
      return { day, label: DAY_LABELS[day], closed: true };
    }
    const open = minutesToLabel(range.min);
    const close = minutesToLabel(range.max);
    return {
      day,
      label: DAY_LABELS[day],
      closed: false,
      open,
      close,
      range: `${open} - ${close}`,
    };
  });
}

/**
 * Agrupa días consecutivos con el mismo horario para mostrar
 * resumen tipo "Lunes - Viernes: 8:00 AM - 7:00 PM".
 */
export function groupConsecutiveHours(hours: WeeklyHour[]): Array<{
  label: string;
  hours: string;
  closed: boolean;
}> {
  const groups: Array<{ label: string; hours: string; closed: boolean; start: WeeklyHour; end: WeeklyHour }> = [];

  for (const h of hours) {
    const last = groups[groups.length - 1];
    const sameAsLast = last && last.hours === (h.closed ? "Cerrado" : h.range || "");
    if (sameAsLast) {
      last.end = h;
      last.label = last.start.label === last.end.label
        ? last.start.label
        : `${last.start.label} - ${last.end.label}`;
    } else {
      groups.push({
        label: h.label,
        hours: h.closed ? "Cerrado" : h.range || "",
        closed: h.closed,
        start: h,
        end: h,
      });
    }
  }

  return groups.map((g) => ({ label: g.label, hours: g.hours, closed: g.closed }));
}

/**
 * Texto corto para el badge del hero. Ej: "Lun-Vie 8AM-7PM"
 */
export function buildHoursBadge(hours: WeeklyHour[]): string {
  const groups = groupConsecutiveHours(hours).filter((g) => !g.closed);
  if (groups.length === 0) return "Consulta horarios";
  const first = groups[0];
  // versión compacta
  return `${first.label}: ${first.hours}`;
}
