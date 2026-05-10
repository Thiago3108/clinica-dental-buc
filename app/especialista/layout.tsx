import Link from "next/link";
import { redirect } from "next/navigation";
import { Stethoscope, LayoutDashboard, Calendar, Settings, LogOut } from "lucide-react";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/especialista/LogoutButton";

export default async function EspecialistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const me = await getCurrentUser();
  if (!me) {
    redirect("/admin/login?error=no_role");
  }
  if (me.role === "super_admin") {
    redirect("/admin");
  }
  if (me.role !== "specialist" || !me.specialistId) {
    redirect("/admin/login");
  }

  const admin = createSupabaseAdminClient();
  const { data: specialist } = await admin
    .from("specialists")
    .select("name, title, photo_url")
    .eq("id", me.specialistId)
    .single();

  return (
    <div className="min-h-screen bg-bg-secondary">
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/especialista" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 hidden sm:block">
              <p className="font-bold text-text-primary text-sm truncate">{specialist?.name || "Especialista"}</p>
              <p className="text-xs text-text-muted truncate">{specialist?.title || "Clínica Dental Buc"}</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink href="/especialista" icon={<LayoutDashboard className="w-4 h-4" />} label="Inicio" />
            <NavLink href="/especialista/citas" icon={<Calendar className="w-4 h-4" />} label="Citas" />
            <NavLink href="/especialista/configuracion" icon={<Settings className="w-4 h-4" />} label="Perfil" />
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-text-secondary hover:text-primary px-2.5 sm:px-3 py-2 rounded-lg hover:bg-bg-secondary transition-colors inline-flex items-center gap-1.5"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
