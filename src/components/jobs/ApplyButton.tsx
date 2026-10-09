"use client";

import { MessageCircle, Send } from "lucide-react";

interface Props {
  jobTitle: string;
  company: string;
  jobUrl: string;
}

export default function ApplyButton({ jobTitle, company, jobUrl }: Props) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";

  const text = encodeURIComponent(
    `Hello! I'm interested in the "${jobTitle}" position at ${company}. ${jobUrl}`
  );
  const waHref = phone
    ? `https://wa.me/${phone}?text=${text}`
    : "#";

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary flex-1"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        Apply via WhatsApp
      </a>
      <a href="/contact" className="btn-outline flex-1">
        <Send className="mr-2 h-4 w-4" />
        Contact Our Team
      </a>
    </div>
  );
}