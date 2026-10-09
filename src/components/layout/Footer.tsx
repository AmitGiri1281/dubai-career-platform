import Link from "next/link";
import { Briefcase, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-display font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-lg gradient-gold text-white">
              <Briefcase className="h-5 w-5" />
            </span>
            <span>Dubai Career</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Your trusted partner for jobs and career support across Dubai and the UAE.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Explore</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/jobs" className="hover:text-foreground">Jobs</Link></li>
            <li><Link href="/services" className="hover:text-foreground">Services</Link></li>
            <li><Link href="/success-stories" className="hover:text-foreground">Success Stories</Link></li>
            <li><Link href="/faqs" className="hover:text-foreground">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Services</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>CV Preparation</li>
            <li>Job Assistance</li>
            <li>Interview Prep</li>
            <li>Travel & Documentation</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Contact</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Business Bay, Dubai, UAE</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +971 50 000 0000</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@dubaicareer.ae</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Dubai Career Support. All rights reserved.</p>
          <p>Built with Next.js & Prisma</p>
        </div>
      </div>
    </footer>
  );
}