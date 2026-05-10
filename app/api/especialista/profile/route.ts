import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
});

export async function PATCH(request: NextRequest) {
  const me = await getCurrentUser();
  if (!me || me.role !== "specialist" || !me.specialistId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("specialists")
      .update({
        name: data.name,
        title: data.title || null,
        description: data.description || null,
        photo_url: data.photo_url || null,
        phone: data.phone || null,
        email: data.email || null,
      })
      .eq("id", me.specialistId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
  }
}
