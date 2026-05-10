import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export type CurrentUser = {
  userId: string;
  email: string | null;
  role: UserRole;
  specialistId: string | null;
};

/**
 * Obtiene la sesión del usuario actual junto con su rol.
 * Devuelve null si no hay sesión o si el usuario no tiene rol asignado.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Usamos admin client para evitar problemas de RLS con la tabla user_roles
  const admin = createSupabaseAdminClient();
  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role, specialist_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!roleRow) return null;

  return {
    userId: user.id,
    email: user.email || null,
    role: roleRow.role as UserRole,
    specialistId: roleRow.specialist_id,
  };
}

export async function requireSuperAdmin(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") return null;
  return user;
}

export async function requireSpecialist(): Promise<CurrentUser | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "specialist" || !user.specialistId) return null;
  return user;
}
