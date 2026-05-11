import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/public/PublicHeader";
import { HeroSection } from "@/components/public/HeroSection";
import { StatsSection } from "@/components/public/StatsSection";
import { SpecialtiesSection } from "@/components/public/SpecialtiesSection";
import { WhyChooseUsSection } from "@/components/public/WhyChooseUsSection";
import { TeamSection } from "@/components/public/TeamSection";
import { GallerySection } from "@/components/public/GallerySection";
import { LocationSection } from "@/components/public/LocationSection";
import { PublicFooter } from "@/components/public/PublicFooter";
import { FloatingWhatsApp } from "@/components/public/FloatingWhatsApp";
import { computeWeeklyHours } from "@/lib/business-hours";
import type { SpecialistWithSpecialties } from "@/lib/types";

export default async function PublicLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createSupabaseAdminClient();

  const { data: center } = await supabase
    .from("dental_centers")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!center) notFound();

  const [specialtiesRes, specialistsRes] = await Promise.all([
    supabase
      .from("specialties")
      .select("*")
      .eq("dental_center_id", center.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("specialists")
      .select(`
        *,
        specialist_specialties (
          specialty:specialties (*)
        )
      `)
      .eq("dental_center_id", center.id)
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  const specialists: SpecialistWithSpecialties[] = (specialistsRes.data || []).map(
    (s: { specialist_specialties?: Array<{ specialty: unknown }> } & Record<string, unknown>) => ({
      ...s,
      specialties: (s.specialist_specialties || []).map((ss) => ss.specialty),
    }),
  ) as SpecialistWithSpecialties[];

  // Horarios consolidados de la clínica desde la BD
  const specialistIds = specialists.map((s) => s.id);
  const { data: workingHours } = specialistIds.length > 0
    ? await supabase
        .from("specialist_working_hours")
        .select("day_of_week, start_time, end_time, is_active")
        .in("specialist_id", specialistIds)
    : { data: [] };

  const weeklyHours = computeWeeklyHours(workingHours || []);

  return (
    <>
      <PublicHeader center={center} />
      <main className="flex-1">
        <HeroSection center={center} weeklyHours={weeklyHours} />
        <StatsSection />
        <SpecialtiesSection specialties={specialtiesRes.data || []} />
        <WhyChooseUsSection />
        <TeamSection specialists={specialists} />
        <GallerySection />
        <LocationSection center={center} weeklyHours={weeklyHours} />
      </main>
      <PublicFooter center={center} />
      {center.whatsapp && (
        <FloatingWhatsApp
          phone={center.whatsapp}
          message="Hola Dr. Jhonny! 👋"
        />
      )}
    </>
  );
}
