import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildAuthUrl, isGoogleCalendarConfigured } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json(
      { error: "Google Calendar no está configurado en el servidor" },
      { status: 500 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const specialistId = request.nextUrl.searchParams.get("specialistId");
  if (!specialistId) {
    return NextResponse.json({ error: "Falta specialistId" }, { status: 400 });
  }

  const url = buildAuthUrl(specialistId);
  return NextResponse.redirect(url);
}
