import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { createCalendarEvent } from "@/lib/google-calendar";

const schema = z.object({
  dentalCenterId: z.string().uuid(),
  specialistId: z.string().uuid(),
  specialtyId: z.string().uuid().nullable().optional(),
  treatmentId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  appointmentType: z.enum(["first_visit", "treatment"]),
  isFirstVisit: z.boolean(),
  patient: z.object({
    name: z.string().min(2),
    phone: z.string().min(7),
    email: z.string().email().nullable().optional(),
  }),
  reason: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const supabase = createSupabaseAdminClient();

    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("specialist_id", data.specialistId)
      .neq("status", "cancelled")
      .or(`and(start_time.lt.${data.endTime},end_time.gt.${data.startTime})`)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Este horario ya no está disponible. Por favor selecciona otro." },
        { status: 409 }
      );
    }

    const { data: existingPatient } = await supabase
      .from("patients")
      .select("*")
      .eq("phone", data.patient.phone)
      .maybeSingle();

    let patientId: string;
    if (existingPatient) {
      patientId = existingPatient.id;
      await supabase
        .from("patients")
        .update({
          name: data.patient.name,
          email: data.patient.email || existingPatient.email,
        })
        .eq("id", patientId);
    } else {
      const { data: newPatient, error: patientError } = await supabase
        .from("patients")
        .insert({
          name: data.patient.name,
          phone: data.patient.phone,
          email: data.patient.email,
        })
        .select()
        .single();
      if (patientError || !newPatient) {
        return NextResponse.json({ error: "Error al crear paciente" }, { status: 500 });
      }
      patientId = newPatient.id;
    }

    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .insert({
        dental_center_id: data.dentalCenterId,
        specialist_id: data.specialistId,
        specialty_id: data.specialtyId,
        treatment_id: data.treatmentId,
        patient_id: patientId,
        appointment_type: data.appointmentType,
        start_time: data.startTime,
        end_time: data.endTime,
        status: "confirmed",
        reason: data.reason,
        is_first_visit: data.isFirstVisit,
      })
      .select()
      .single();

    if (aptError || !appointment) {
      console.error("Appointment error:", aptError);
      return NextResponse.json(
        { error: aptError?.message || "Error al crear cita" },
        { status: 500 }
      );
    }

    const [centerRes, specialistRes, treatmentRes] = await Promise.all([
      supabase.from("dental_centers").select("name, timezone").eq("id", data.dentalCenterId).single(),
      supabase
        .from("specialists")
        .select("name, calendar_id, google_refresh_token")
        .eq("id", data.specialistId)
        .single(),
      supabase.from("treatments").select("name").eq("id", data.treatmentId).single(),
    ]);

    const timezone = centerRes.data?.timezone || "America/Bogota";

    if (specialistRes.data?.google_refresh_token && specialistRes.data?.calendar_id) {
      const treatmentName = treatmentRes.data?.name || "Consulta";
      const visitTag = data.isFirstVisit ? "[Valoración] " : "";
      const summary = `${visitTag}${treatmentName} - ${data.patient.name}`;
      const descriptionLines = [
        `Paciente: ${data.patient.name}`,
        `Teléfono: ${data.patient.phone}`,
        data.patient.email ? `Email: ${data.patient.email}` : null,
        `Tratamiento: ${treatmentName}`,
        data.reason ? `Motivo: ${data.reason}` : null,
        "",
        "Cita generada por Clínica Dental Buc",
      ].filter(Boolean);

      createCalendarEvent({
        refreshToken: specialistRes.data.google_refresh_token,
        calendarId: specialistRes.data.calendar_id,
        summary,
        description: descriptionLines.join("\n"),
        startTime: data.startTime,
        endTime: data.endTime,
        timezone,
        attendeeEmail: data.patient.email || null,
      })
        .then(async (eventId) => {
          if (eventId) {
            await supabase
              .from("appointments")
              .update({ google_calendar_event_id: eventId })
              .eq("id", appointment.id);
          }
        })
        .catch((err) => console.error("Calendar event error:", err));
    }

    return NextResponse.json({ appointment, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
