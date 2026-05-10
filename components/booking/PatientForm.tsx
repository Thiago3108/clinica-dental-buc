"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Phone, Mail, MessageSquare } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z
    .string()
    .min(7, "Ingresa un teléfono válido")
    .regex(/^[0-9+\s-]+$/, "Solo números, +, espacios y guiones"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  reason: z.string().optional(),
});

export type PatientFormData = z.infer<typeof schema>;

type PatientFormProps = {
  isFirstVisit: boolean;
  defaultValues?: Partial<PatientFormData>;
  onSubmit: (data: PatientFormData) => void;
};

export function PatientForm({ isFirstVisit, defaultValues, onSubmit }: PatientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Tus datos
        </h2>
        <p className="text-text-secondary">
          Necesitamos esta información para confirmar tu cita
        </p>
      </div>

      <form id="patient-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Nombre completo *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              {...register("name")}
              placeholder="Ej: Juan Pérez"
              className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition"
            />
          </div>
          {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Teléfono / WhatsApp *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="tel"
              {...register("phone")}
              placeholder="Ej: 3001234567"
              className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition"
            />
          </div>
          {errors.phone && <p className="text-error text-xs mt-1">{errors.phone.message}</p>}
          <p className="text-xs text-text-muted mt-1">
            Te enviaremos la confirmación y recordatorio por WhatsApp
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="email"
              {...register("email")}
              placeholder="opcional"
              className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition"
            />
          </div>
          {errors.email && <p className="text-error text-xs mt-1">{errors.email.message}</p>}
        </div>

        {isFirstVisit && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Motivo de la consulta
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
              <textarea
                {...register("reason")}
                rows={3}
                placeholder="Describe brevemente lo que estás sintiendo o lo que necesitas"
                className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition resize-none"
              />
            </div>
            <p className="text-xs text-text-muted mt-1">
              Esta información ayudará al especialista a prepararse para tu cita
            </p>
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="hidden" />
      </form>
    </div>
  );
}
