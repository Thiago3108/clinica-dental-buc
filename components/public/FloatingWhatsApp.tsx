import { MessageCircle } from "lucide-react";

type Props = {
  phone: string;
  message?: string;
};

export function FloatingWhatsApp({ phone, message = "¡Hola! Quisiera más información sobre los servicios" }: Props) {
  const cleaned = phone.replace(/\D/g, "");
  const url = `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#1ebe57] text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105"
    >
      <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" fill="currentColor" />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
    </a>
  );
}
