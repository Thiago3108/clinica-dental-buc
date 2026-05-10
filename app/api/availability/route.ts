import { NextRequest, NextResponse } from "next/server";
import { getSpecialistAvailability } from "@/lib/availability";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const specialistId = searchParams.get("specialistId");
  const durationMinutes = Number(searchParams.get("durationMinutes") || 30);
  const dentalCenterId = searchParams.get("dentalCenterId");

  if (!specialistId || !dentalCenterId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: center } = await supabase
    .from("dental_centers")
    .select("timezone")
    .eq("id", dentalCenterId)
    .single();

  const timezone = center?.timezone || "America/Bogota";

  try {
    const days = await getSpecialistAvailability(
      specialistId,
      durationMinutes,
      14,
      timezone
    );
    return NextResponse.json({ days });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json({ error: "Error al obtener disponibilidad" }, { status: 500 });
  }
}
