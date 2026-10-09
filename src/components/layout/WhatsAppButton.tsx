"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  const message = encodeURIComponent("Hello! I'd like to know more about your career services.");
  const href = `https://wa.me/${phone}?text=${message}`;

  if (!phone) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}