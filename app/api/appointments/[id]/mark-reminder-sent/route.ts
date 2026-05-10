import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createSupabaseAdminClient();

  if (user.role === "specialist") {
    const { data: apt } = await supabase
      .from("appointments")
      .select("specialist_id")
      .eq("id", id)
      .single();
    if (!apt || apt.specialist_id !== user.specialistId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
  }

  const { error } = await supabase
    .from("appointments")
    .update({ reminder_sent: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
