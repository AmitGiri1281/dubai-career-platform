import type { Metadata } from "next";
import { Mail, Phone, MapPin, MessageCircle, Clock } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Dubai Career Support",
  description:
    "Get in touch with our Dubai career experts. Reach out via WhatsApp, email, or phone for CV help, job assistance, and UAE documentation guidance.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  const contactEmail = process.env.CONTACT_EMAIL ?? "info@dubaicareer.ae";
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        "Hello! I'd like to know more about your career services."
      )}`
    : "#";

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-accent/40 to-background">
        <div className="container-page py-16 lg:py-20 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Contact
          </span>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
            Let's talk about your career
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Have a question or ready to start? Send us a message and our team
            will get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container-page py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          {/* Contact info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Get in touch
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose the channel that works best for you.
              </p>
            </div>

            {/* WhatsApp */}
            {whatsapp && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="card-base flex items-start gap-4 transition hover:border-primary/40"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#25D366]/10 text-[#25D366]">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">WhatsApp (fastest)</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Chat with us instantly
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#25D366]">
                    {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
                  </p>
                </div>
              </a>
            )}

            {/* Email */}
            <a
              href={`mailto:${contactEmail}`}
              className="card-base flex items-start gap-4 transition hover:border-primary/40"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Email</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  For detailed inquiries
                </p>
                <p className="mt-1 text-sm font-medium text-primary">
                  {contactEmail}
                </p>
              </div>
            </a>

            {/* Phone */}
            <a
              href={`tel:${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              className="card-base flex items-start gap-4 transition hover:border-primary/40"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Phone className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Phone</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Mon–Sat, 9am–7pm GST
                </p>
                <p className="mt-1 text-sm font-medium text-primary">
                  {process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
                </p>
              </div>
            </a>

            {/* Office */}
            <div className="card-base flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Office</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Business Bay, Dubai, UAE
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> Response within 24 hours
                </p>
              </div>
            </div>

            {/* Business hours */}
            <div className="rounded-xl border border-border bg-secondary/40 p-5">
              <h3 className="text-sm font-semibold">Business Hours</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex justify-between">
                  <span>Monday – Friday</span>
                  <span className="font-medium text-foreground">
                    9:00 AM – 7:00 PM
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium text-foreground">
                    10:00 AM – 4:00 PM
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-muted-foreground">
                    Closed
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="mb-5 font-display text-2xl font-bold">
              Send us a message
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="container-page pb-16 lg:pb-20">
        <div className="overflow-hidden rounded-2xl border border-border">
          <iframe
            title="Office location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.1788977243!2d55.27218771500813!3d25.18588898389594!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f682dbe7cd7d5%3A0x5e0d0e7e5d9e5e5e!2sBusiness%20Bay%2C%20Dubai!5e0!3m2!1sen!2sae!4v1700000000000"
            width="100%"
            height="400"
            loading="lazy"
            style={{ border: 0 }}
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </>
  );
}