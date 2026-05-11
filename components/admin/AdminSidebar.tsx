"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  Clock,
  Settings,
  LogOut,
  Stethoscope,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reservas", label: "Citas", icon: Calendar },
  { href: "/admin/especialistas", label: "Especialistas", icon: Users },
  { href: "/admin/tratamientos", label: "Tratamientos", icon: ClipboardList },
  { href: "/admin/horarios", label: "Horarios", icon: Clock },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-border rounded-lg shadow-md"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[82vw] max-w-sm lg:w-64 bg-white border-r border-border flex flex-col transition-transform z-40 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-text-primary text-sm">Clínica Buc</p>
              <p className="text-xs text-text-muted">Panel administrativo</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-bg-soft-blue text-primary"
                    : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-secondary transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
