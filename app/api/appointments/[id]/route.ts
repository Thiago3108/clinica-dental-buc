import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { deleteCalendarEvent, updateCalendarEvent } from "@/lib/google-calendar";
import { getCurrentUser } from "@/lib/auth";

const updateSchema = z.object({
  status: z.enum(["confirmed", "cancelled", "completed", "no_show", "pending"]).optional(),
  notes: z.string().nullable().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  treatmentId: z.string().uuid().optional(),
  isFirstVisit: z.boolean().optional(),
  reason: z.string().nullable().optional(),
  patient: z.object({
    name: z.string().min(2),
    phone: z.string().min(7),
    email: z.string().email().nullable().optional(),
  }).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await request.json();
    const data = updateSchema.parse(body);
    const supabase = createSupabaseAdminClient();

    const { data: prev } = await supabase
      .from("appointments")
      .select("status, google_calendar_event_id, specialist_id, patient_id, dental_center_id, treatment_id, start_time, end_time, is_first_visit")
      .eq("id", id)
      .single();

    // Si es especialista, solo puede modificar sus propias citas
    if (me.role === "specialist" && prev?.specialist_id !== me.specialistId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const appointmentUpdate: Record<string, unknown> = {};
    if (data.status !== undefined) appointmentUpdate.status = data.status;
    if (data.notes !== undefined) appointmentUpdate.notes = data.notes;
    if (data.startTime !== undefined) appointmentUpdate.start_time = data.startTime;
    if (data.endTime !== undefined) appointmentUpdate.end_time = data.endTime;
    if (data.reason !== undefined) appointmentUpdate.reason = data.reason;
    if (data.isFirstVisit !== undefined) {
      appointmentUpdate.is_first_visit = data.isFirstVisit;
      appointmentUpdate.appointment_type = data.isFirstVisit ? "first_visit" : "treatment";
    }

    let updatedTreatmentName: string | null = null;
    let updatedPatientName: string | null = null;
    let updatedPatientEmail: string | null = null;

    if (data.treatmentId !== undefined) {
      const { data: treatment } = await supabase
        .from("treatments")
        .select("id, specialty_id, name, duration_minutes")
        .eq("id", data.treatmentId)
        .single();

      if (!treatment) {
        return NextResponse.json({ error: "Tratamiento no válido" }, { status: 400 });
      }

      appointmentUpdate.treatment_id = treatment.id;
      appointmentUpdate.specialty_id = treatment.specialty_id;
      updatedTreatmentName = treatment.name;
    }

    if (data.patient) {
      const { error: patientError } = await supabase
        .from("patients")
        .update({
          name: data.patient.name,
          phone: data.patient.phone,
          email: data.patient.email || null,
        })
        .eq("id", prev?.patient_id);

      if (patientError) {
        return NextResponse.json({ error: patientError.message }, { status: 500 });
      }

      updatedPatientName = data.patient.name;
      updatedPatientEmail = data.patient.email || null;
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .update(appointmentUpdate)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (prev?.specialist_id && prev?.google_calendar_event_id) {
      const { data: specialist } = await supabase
        .from("specialists")
        .select("name, calendar_id, google_refresh_token")
        .eq("id", prev.specialist_id)
        .single();

      if (specialist?.calendar_id && specialist?.google_refresh_token) {
        if (data.status === "cancelled") {
          if (prev.status !== "cancelled") {
            deleteCalendarEvent(
              specialist.google_refresh_token,
              specialist.calendar_id,
              prev.google_calendar_event_id
            ).catch((err) => console.error("Calendar delete error:", err));
          }
        } else {
          const currentTreatmentId = (appointmentUpdate.treatment_id || prev.treatment_id) as string | undefined;
          const { data: center } = await supabase
            .from("dental_centers")
            .select("timezone")
            .eq("id", prev.dental_center_id)
            .single();

          const { data: treatment } = await supabase
            .from("treatments")
            .select("name")
            .eq("id", currentTreatmentId)
            .single();

          const { data: patient } = await supabase
            .from("patients")
            .select("name, email")
            .eq("id", prev.patient_id)
            .single();

          const treatmentName = updatedTreatmentName || treatment?.name || "Consulta";
          const patientName = updatedPatientName || patient?.name || "Paciente";
          const patientEmail = updatedPatientEmail ?? patient?.email ?? null;
          const visitTag = (appointmentUpdate.is_first_visit ?? prev.is_first_visit) ? "[Valoración] " : "";
          const summary = `${visitTag}${treatmentName} - ${patientName}`;
          const descriptionLines = [
            `Paciente: ${patientName}`,
            `Email: ${patientEmail || "No registrado"}`,
            `Tratamiento: ${treatmentName}`,
            "Cita actualizada desde el panel administrativo",
          ];

          await updateCalendarEvent(
            specialist.google_refresh_token,
            specialist.calendar_id,
            prev.google_calendar_event_id,
            {
              summary,
              description: descriptionLines.join("\n"),
              startTime: (appointmentUpdate.start_time as string | undefined) || prev.start_time,
              endTime: (appointmentUpdate.end_time as string | undefined) || prev.end_time,
              timezone: center?.timezone || "America/Bogota",
              status: "confirmed",
            }
          ).catch((err) => console.error("Calendar update error:", err));
        }
      }
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar cita" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: prev } = await supabase
    .from("appointments")
    .select("google_calendar_event_id, specialist_id")
    .eq("id", id)
    .single();

  if (me.role === "specialist" && prev?.specialist_id !== me.specialistId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (prev?.google_calendar_event_id && prev?.specialist_id) {
    const { data: specialist } = await supabase
      .from("specialists")
      .select("calendar_id, google_refresh_token")
      .eq("id", prev.specialist_id)
      .single();

    if (specialist?.calendar_id && specialist?.google_refresh_token) {
      await deleteCalendarEvent(
        specialist.google_refresh_token,
        specialist.calendar_id,
        prev.google_calendar_event_id
      ).catch((err) => console.error("Calendar delete error:", err));
    }
  }

  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
