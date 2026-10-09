"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/jobs", label: "Jobs" },
  { href: "/jobs/smart-search", label: "Smart Search" },
  { href: "/job-match", label: "AI Match" },
  { href: "/services", label: "Services" },
  { href: "/success-stories", label: "Success Stories" },
  { href: "/blog", label: "Blog" },
  { href: "/resume-check", label: "Free CV Check" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact", label: "Contact" },
];
export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg gradient-gold text-white">
            <Briefcase className="h-5 w-5" />
          </span>
          <span className="text-lg">Dubai Career</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition hover:bg-accent",
                  pathname === l.href && "bg-accent text-accent-foreground"
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/contact" className="btn-primary">
            Get Started
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          className="rounded-md p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <ul className="container-page flex flex-col py-3">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent",
                    pathname === l.href && "bg-accent"
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <Link href="/contact" onClick={() => setOpen(false)} className="btn-primary w-full">
                Get Started
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}