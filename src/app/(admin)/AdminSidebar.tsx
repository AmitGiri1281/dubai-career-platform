"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminSidebar({
  user,
}: {
  user: { name: string; role: string };
}) {
  const pathname = usePathname();

  return (
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
        </nav>

        <div className="border-t border-border p-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}