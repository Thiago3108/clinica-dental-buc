import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth";

const createSchema = z.object({
  specialistId: z.string().uuid(),
  email: z.string().email(),
  password: z.string().min(6),
});

const deleteSchema = z.object({
  specialistId: z.string().uuid(),
});

const resetPwdSchema = z.object({
  specialistId: z.string().uuid(),
  password: z.string().min(6),
});

// Crear usuario auth para un especialista
export async function POST(request: NextRequest) {
  const admin = await requireSuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Solo el super admin puede crear credenciales" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { specialistId, email, password } = createSchema.parse(body);
    const supabase = createSupabaseAdminClient();

    // Verificar que el especialista no tenga ya un usuario asignado
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("specialist_id", specialistId)
      .maybeSingle();

    if (existingRole) {
      return NextResponse.json({ error: "Este especialista ya tiene credenciales asignadas" }, { status: 409 });
    }

    // Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || "Error al crear usuario" }, { status: 500 });
    }

    // Crear role
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: authData.user.id,
      role: "specialist",
      specialist_id: specialistId,
    });

    if (roleError) {
      // Rollback: borrar el usuario auth creado
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: roleError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al procesar" }, { status: 500 });
  }
}

// Cambiar contraseña del especialista
export async function PATCH(request: NextRequest) {
  const admin = await requireSuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Solo el super admin puede cambiar contraseñas" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { specialistId, password } = resetPwdSchema.parse(body);
    const supabase = createSupabaseAdminClient();

    const { data: role } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("specialist_id", specialistId)
      .maybeSingle();

    if (!role) {
      return NextResponse.json({ error: "Este especialista no tiene credenciales" }, { status: 404 });
    }

    const { error } = await supabase.auth.admin.updateUserById(role.user_id, { password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al procesar" }, { status: 500 });
  }
}

// Eliminar usuario auth del especialista
export async function DELETE(request: NextRequest) {
  const admin = await requireSuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Solo el super admin puede eliminar credenciales" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { specialistId } = deleteSchema.parse(body);
    const supabase = createSupabaseAdminClient();

    const { data: role } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("specialist_id", specialistId)
      .maybeSingle();

    if (!role) {
      return NextResponse.json({ success: true });
    }

    // Borrar user_role primero
    await supabase.from("user_roles").delete().eq("specialist_id", specialistId);
    // Borrar usuario auth
    await supabase.auth.admin.deleteUser(role.user_id);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al procesar" }, { status: 500 });
  }
}
