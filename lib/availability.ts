import { addDays, format, parse, addMinutes, isBefore, isAfter, startOfDay } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { createSupabaseAdminClient } from "./supabase/server";
import type { DayAvailability, TimeSlot } from "./types";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export async function getSpecialistAvailability(
  specialistId: string,
  durationMinutes: number,
  daysAhead: number = 14,
  timezone: string = "America/Bogota"
): Promise<DayAvailability[]> {
  const supabase = createSupabaseAdminClient();

  const [hoursRes, breaksRes, blockedRes] = await Promise.all([
    supabase
      .from("specialist_working_hours")
      .select("*")
      .eq("specialist_id", specialistId)
      .eq("is_active", true),
    supabase
      .from("specialist_breaks")
      .select("*")
      .eq("specialist_id", specialistId)
      .eq("is_active", true),
    supabase
      .from("blocked_dates")
      .select("date")
      .eq("specialist_id", specialistId),
  ]);

  const workingHours = hoursRes.data || [];
  const breaks = breaksRes.data || [];
  const blockedDates = new Set((blockedRes.data || []).map((b) => b.date));

  const now = new Date();
  const startWindow = startOfDay(now);
  const endWindow = addDays(startWindow, daysAhead + 1);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("start_time, end_time, status")
    .eq("specialist_id", specialistId)
    .gte("start_time", startWindow.toISOString())
    .lt("start_time", endWindow.toISOString())
    .neq("status", "cancelled");

  const days: DayAvailability[] = [];

  for (let i = 0; i < daysAhead; i++) {
    const date = addDays(startWindow, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = date.getDay();

    const dayLabel = `${DAY_NAMES[dayOfWeek]} ${format(date, "d")}`;

    if (blockedDates.has(dateStr)) {
      days.push({
        date: dateStr,
        label: dayLabel,
        available: false,
        slotsCount: 0,
        slots: [],
        status: "closed",
      });
      continue;
    }

    const dayHours = workingHours.find((h) => h.day_of_week === dayOfWeek);
    if (!dayHours) {
      days.push({
        date: dateStr,
        label: dayLabel,
        available: false,
        slotsCount: 0,
        slots: [],
        status: "closed",
      });
      continue;
    }

    const dayBreaks = breaks.filter((b) => b.day_of_week === dayOfWeek);

    const slots = generateSlots(
      dateStr,
      dayHours.start_time,
      dayHours.end_time,
      durationMinutes,
      dayBreaks,
      appointments || [],
      timezone,
      now
    );

    const availableSlots = slots.filter((s) => s.available);
    let status: DayAvailability["status"] = "closed";
    if (availableSlots.length === 0) status = "full";
    else if (availableSlots.length <= 2) status = "few";
    else status = "open";

    days.push({
      date: dateStr,
      label: dayLabel,
      available: availableSlots.length > 0,
      slotsCount: availableSlots.length,
      slots,
      status,
    });
  }

  return days;
}

function generateSlots(
  dateStr: string,
  startTimeStr: string,
  endTimeStr: string,
  durationMinutes: number,
  breaks: Array<{ start_time: string; end_time: string }>,
  appointments: Array<{ start_time: string; end_time: string }>,
  timezone: string,
  now: Date
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  const dayStart = parse(`${dateStr} ${startTimeStr.slice(0, 5)}`, "yyyy-MM-dd HH:mm", new Date());
  const dayEnd = parse(`${dateStr} ${endTimeStr.slice(0, 5)}`, "yyyy-MM-dd HH:mm", new Date());

  let current = dayStart;

  while (true) {
    const slotEnd = addMinutes(current, durationMinutes);
    if (isAfter(slotEnd, dayEnd)) break;

    const slotStartUtc = fromZonedTime(current, timezone);
    const slotEndUtc = fromZonedTime(slotEnd, timezone);

    let available = true;

    if (isBefore(slotStartUtc, now)) {
      available = false;
    }

    if (available) {
      for (const br of breaks) {
        const breakStart = parse(`${dateStr} ${br.start_time.slice(0, 5)}`, "yyyy-MM-dd HH:mm", new Date());
        const breakEnd = parse(`${dateStr} ${br.end_time.slice(0, 5)}`, "yyyy-MM-dd HH:mm", new Date());
        if (isBefore(current, breakEnd) && isAfter(slotEnd, breakStart)) {
          available = false;
          break;
        }
      }
    }

    if (available) {
      for (const apt of appointments) {
        const aptStart = new Date(apt.start_time);
        const aptEnd = new Date(apt.end_time);
        if (isBefore(slotStartUtc, aptEnd) && isAfter(slotEndUtc, aptStart)) {
          available = false;
          break;
        }
      }
    }

    slots.push({
      startTime: slotStartUtc.toISOString(),
      endTime: slotEndUtc.toISOString(),
      available,
      label: format(current, "h:mm a").toLowerCase(),
    });

    current = addMinutes(current, durationMinutes);
  }

  return slots;
}
