import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ redirect: "/admin/login", error: "no_role" }, { status: 401 });
  }
  const redirect = user.role === "super_admin" ? "/admin" : "/especialista";
  return NextResponse.json({ redirect, role: user.role });
}
