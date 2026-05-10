import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import {
  exchangeCodeForTokens,
  getPrimaryCalendarId,
  isGoogleCalendarConfigured,
} from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  const baseUrl = new URL("/admin/especialistas", request.url);

  if (!isGoogleCalendarConfigured()) {
    baseUrl.searchParams.set("gc_error", "no_config");
    return NextResponse.redirect(baseUrl);
  }

  const authClient = await createSupabaseServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  const specialistId = request.nextUrl.searchParams.get("state");
  const errorParam = request.nextUrl.searchParams.get("error");

  if (errorParam) {
    baseUrl.searchParams.set("gc_error", errorParam);
    return NextResponse.redirect(baseUrl);
  }
  if (!code || !specialistId) {
    baseUrl.searchParams.set("gc_error", "missing_params");
    return NextResponse.redirect(baseUrl);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      baseUrl.searchParams.set("gc_error", "no_refresh_token");
      return NextResponse.redirect(baseUrl);
    }

    const calendarId = await getPrimaryCalendarId(tokens.refresh_token);

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("specialists")
      .update({
        google_refresh_token: tokens.refresh_token,
        calendar_id: calendarId,
      })
      .eq("id", specialistId);

    if (error) {
      console.error("DB update error:", error);
      baseUrl.searchParams.set("gc_error", "db");
      return NextResponse.redirect(baseUrl);
    }

    baseUrl.searchParams.set("gc_success", "1");
    return NextResponse.redirect(baseUrl);
  } catch (err) {
    console.error("OAuth callback error:", err);
    baseUrl.searchParams.set("gc_error", "exchange");
    return NextResponse.redirect(baseUrl);
  }
}
