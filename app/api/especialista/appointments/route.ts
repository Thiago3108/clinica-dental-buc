import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const createSchema = z.object({
  specialistId: z.string().uuid(),
  specialtyId: z.string().uuid().nullable().optional(),
  treatmentId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  isFirstVisit: z.boolean(),
  reason: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  patient: z.object({
    name: z.string().min(2),
    phone: z.string().min(7),
    email: z.string().email().nullable().optional(),
  }),
});

export async function POST(request: NextRequest) {
  const me = await getCurrentUser();
  if (!me || me.role !== "specialist" || !me.specialistId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    // El especialista solo puede crear citas para sí mismo
    if (data.specialistId !== me.specialistId) {
      return NextResponse.json({ error: "No puedes crear citas de otro especialista" }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();

    // Verificar conflicto
    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("specialist_id", data.specialistId)
      .neq("status", "cancelled")
      .or(`and(start_time.lt.${data.endTime},end_time.gt.${data.startTime})`)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Ya tienes una cita en ese horario" }, { status: 409 });
    }

    // Buscar/crear paciente
    let patientId: string;
    const { data: existingPatient } = await supabase
      .from("patients")
      .select("*")
      .eq("phone", data.patient.phone)
      .maybeSingle();

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

    // Obtener dental_center_id desde el specialist
    const { data: specialist } = await supabase
      .from("specialists")
      .select("dental_center_id")
      .eq("id", data.specialistId)
      .single();

    if (!specialist) {
      return NextResponse.json({ error: "Especialista no encontrado" }, { status: 404 });
    }

    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .insert({
        dental_center_id: specialist.dental_center_id,
        specialist_id: data.specialistId,
        specialty_id: data.specialtyId,
        treatment_id: data.treatmentId,
        patient_id: patientId,
        appointment_type: data.isFirstVisit ? "first_visit" : "treatment",
        start_time: data.startTime,
        end_time: data.endTime,
        status: "confirmed",
        reason: data.reason,
        notes: data.notes,
        is_first_visit: data.isFirstVisit,
        // Citas creadas por el especialista internamente: ya están "confirmadas"
        confirmation_sent: true,
      })
      .select()
      .single();

    if (aptError || !appointment) {
      return NextResponse.json(
        { error: aptError?.message || "Error al crear cita" },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointment, success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
