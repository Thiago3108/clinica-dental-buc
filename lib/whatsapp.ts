/**
 * Construye un enlace wa.me que abre WhatsApp con un mensaje prellenado.
 * El especialista hace clic en "Enviar" manualmente desde WhatsApp.
 */

type ConfirmationParams = {
  patientName: string;
  centerName: string;
  specialistName: string;
  treatmentName: string;
  date: string;       // ej: "lunes 12 de mayo de 2026"
  time: string;       // ej: "10:30 AM"
  address?: string | null;
  isFirstVisit: boolean;
};

type ReminderParams = {
  patientName: string;
  centerName: string;
  specialistName: string;
  treatmentName: string;
  date: string;
  time: string;
  address?: string | null;
};

export function buildConfirmationText(p: ConfirmationParams): string {
  const intro = p.isFirstVisit
    ? `Estimado/a ${p.patientName}, le confirmamos su cita de valoración en ${p.centerName}.`
    : `Estimado/a ${p.patientName}, le confirmamos su cita en ${p.centerName}.`;

  const lines = [
    intro,
    "",
    `📅 *Fecha:* ${p.date}`,
    `🕐 *Hora:* ${p.time}`,
    `🦷 *Procedimiento:* ${p.treatmentName}`,
    `👨‍⚕️ *Especialista:* ${p.specialistName}`,
  ];

  if (p.address) {
    lines.push(`📍 *Ubicación:* ${p.address}`);
  }

  lines.push(
    "",
    "Le recomendamos llegar 10 minutos antes de su cita.",
    "Si requiere cancelar o reprogramar, por favor avísenos con anticipación.",
    "",
    "Cordialmente,",
    p.centerName,
  );

  return lines.join("\n");
}

export function buildReminderText(p: ReminderParams): string {
  const lines = [
    `Estimado/a ${p.patientName}, le recordamos que tiene una cita programada mañana en ${p.centerName}.`,
    "",
    `📅 *Fecha:* ${p.date}`,
    `🕐 *Hora:* ${p.time}`,
    `🦷 *Procedimiento:* ${p.treatmentName}`,
    `👨‍⚕️ *Especialista:* ${p.specialistName}`,
  ];

  if (p.address) {
    lines.push(`📍 *Ubicación:* ${p.address}`);
  }

  lines.push(
    "",
    "Por favor confirme su asistencia respondiendo este mensaje.",
    "Le esperamos puntualmente.",
    "",
    "Cordialmente,",
    p.centerName,
  );

  return lines.join("\n");
}

/**
 * Construye una URL wa.me desde un número de teléfono colombiano.
 * Acepta formatos con o sin +57 / 57 al inicio.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  let cleaned = phone.replace(/\D/g, "");
  // Si el número empieza con 3 y tiene 10 dígitos, asumimos Colombia
  if (cleaned.length === 10 && cleaned.startsWith("3")) {
    cleaned = "57" + cleaned;
  }
  // Si ya tiene 57 al inicio lo dejamos como está
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
