// src/app/(admin)/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const role = (session.user as any).role as string;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/");

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <AdminSidebar user={{ name: session.user.name ?? "Admin", role }} />
      <div className="flex-1 overflow-x-hidden lg:pt-0">
        <div className="mx-auto w-full max-w-7xl p-4 pt-20 lg:p-10 lg:pt-10">
          {children}
        </div>
      </div>
    </div>
  );
}