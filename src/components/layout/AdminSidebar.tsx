"use client";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Tags,
  Star,
  BookOpen,
  HelpCircle,
  Users,
  Inbox,
  Image as ImageIcon,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/blogs", label: "Blogs", icon: BookOpen },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/ai", label: "AI Tools", icon: Sparkles },        // ← ADD
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];
export default function AdminSidebar({
  user,
}: {
  user: { name: string; role: string };
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const NavItems = () => (
    <ul className="space-y-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 hover:bg-accent"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-display font-semibold">Admin</span>
        <div className="w-9" />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Admin Panel
                </p>
                <p className="mt-0.5 truncate font-semibold">{user.name}</p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3">
              <NavItems />
            </nav>
            <div className="border-t border-border p-3">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-border px-5 py-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Admin Panel
            </p>
            <p className="mt-1 truncate font-semibold">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <nav className="flex-1 overflow-y-auto p-3">
            <NavItems />
          </nav>
          <div className="border-t border-border p-3">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}