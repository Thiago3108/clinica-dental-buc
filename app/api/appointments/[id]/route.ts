import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { deleteCalendarEvent } from "@/lib/google-calendar";
import { getCurrentUser } from "@/lib/auth";

const updateSchema = z.object({
  status: z.enum(["confirmed", "cancelled", "completed", "no_show", "pending"]).optional(),
  notes: z.string().nullable().optional(),
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
      .select("status, google_calendar_event_id, specialist_id")
      .eq("id", id)
      .single();

    // Si es especialista, solo puede modificar sus propias citas
    if (me.role === "specialist" && prev?.specialist_id !== me.specialistId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { data: appointment, error } = await supabase
      .from("appointments")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (
      data.status === "cancelled" &&
      prev?.status !== "cancelled" &&
      prev?.google_calendar_event_id &&
      prev?.specialist_id
    ) {
      const { data: specialist } = await supabase
        .from("specialists")
        .select("calendar_id, google_refresh_token")
        .eq("id", prev.specialist_id)
        .single();

      if (specialist?.calendar_id && specialist?.google_refresh_token) {
        deleteCalendarEvent(
          specialist.google_refresh_token,
          specialist.calendar_id,
          prev.google_calendar_event_id
        ).catch((err) => console.error("Calendar delete error:", err));
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
