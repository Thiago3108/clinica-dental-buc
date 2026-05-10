import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { BookingFlow } from "@/components/booking/BookingFlow";
import type { SpecialistWithSpecialties, Treatment } from "@/lib/types";

const CONSULTATION_KEYWORDS = ["consulta", "valoración", "valoracion", "evaluación", "evaluacion"];

export default async function AgendarPage({
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

  const [specialtiesRes, specialistsRes, treatmentsRes] = await Promise.all([
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
    supabase
      .from("treatments")
      .select("*")
      .eq("dental_center_id", center.id)
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  const specialists: SpecialistWithSpecialties[] = (specialistsRes.data || []).map((s: { specialist_specialties?: Array<{ specialty: unknown }> } & Record<string, unknown>) => ({
    ...s,
    specialties: (s.specialist_specialties || []).map((ss) => ss.specialty),
  })) as SpecialistWithSpecialties[];

  const treatments = (treatmentsRes.data || []) as Treatment[];

  const consultationTreatments: Record<string, Treatment> = {};
  for (const specialty of specialtiesRes.data || []) {
    const consultation = treatments.find(
      (t) =>
        t.specialty_id === specialty.id &&
        CONSULTATION_KEYWORDS.some((kw) => t.name.toLowerCase().includes(kw))
    );
    if (consultation) {
      consultationTreatments[specialty.id] = consultation;
    } else {
      const shortest = treatments
        .filter((t) => t.specialty_id === specialty.id)
        .sort((a, b) => a.duration_minutes - b.duration_minutes)[0];
      if (shortest) consultationTreatments[specialty.id] = shortest;
    }
  }

  return (
    <main className="min-h-screen bg-bg-secondary py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/clinica/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-6 sm:p-10">
          <BookingFlow
            center={center}
            specialties={specialtiesRes.data || []}
            specialists={specialists}
            treatments={treatments}
            consultationTreatments={consultationTreatments}
          />
        </div>
      </div>
    </main>
  );
}
