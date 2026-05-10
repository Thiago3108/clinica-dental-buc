import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { revokeRefreshToken } from "@/lib/google-calendar";

const schema = z.object({
  specialistId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const authClient = await createSupabaseServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { specialistId } = schema.parse(body);
    const supabase = createSupabaseAdminClient();

    const { data: specialist } = await supabase
      .from("specialists")
      .select("google_refresh_token")
      .eq("id", specialistId)
      .single();

    if (specialist?.google_refresh_token) {
      await revokeRefreshToken(specialist.google_refresh_token);
    }

    const { error } = await supabase
      .from("specialists")
      .update({ google_refresh_token: null, calendar_id: null })
      .eq("id", specialistId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    console.error("Disconnect error:", err);
    return NextResponse.json({ error: "Error al desconectar" }, { status: 500 });
  }
}
