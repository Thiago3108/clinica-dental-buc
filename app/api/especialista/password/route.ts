import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { password } = schema.parse(body);

    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.updateUserById(me.userId, { password });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Contraseña muy corta" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al cambiar contraseña" }, { status: 500 });
  }
}
