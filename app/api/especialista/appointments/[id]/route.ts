import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const updateSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  treatmentId: z.string().uuid(),
  isFirstVisit: z.boolean(),
  reason: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  patient: z.object({
    name: z.string().min(2),
    phone: z.string().min(7),
    email: z.string().email().nullable().optional(),
  }),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser();
  if (!me || me.role !== "specialist" || !me.specialistId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  // Verificar que la cita pertenece al especialista
  const { data: prev } = await supabase
    .from("appointments")
    .select("specialist_id, patient_id")
    .eq("id", id)
    .single();

  if (!prev || prev.specialist_id !== me.specialistId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);

    // Verificar conflicto con otras citas (excluyendo esta)
    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("specialist_id", me.specialistId)
      .neq("status", "cancelled")
      .neq("id", id)
      .or(`and(start_time.lt.${data.endTime},end_time.gt.${data.startTime})`)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Ya tienes otra cita en ese horario" }, { status: 409 });
    }

    // Actualizar paciente
    await supabase
      .from("patients")
      .update({
        name: data.patient.name,
        phone: data.patient.phone,
        email: data.patient.email,
      })
      .eq("id", prev.patient_id);

    // Actualizar cita
    const { error } = await supabase
      .from("appointments")
      .update({
        start_time: data.startTime,
        end_time: data.endTime,
        treatment_id: data.treatmentId,
        is_first_visit: data.isFirstVisit,
        appointment_type: data.isFirstVisit ? "first_visit" : "treatment",
        reason: data.reason,
        notes: data.notes,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
  }
}
