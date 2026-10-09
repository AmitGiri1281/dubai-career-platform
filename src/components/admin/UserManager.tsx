"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Users, Trash2 } from "lucide-react";
import PageHeader from "./PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatDate, getInitials } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "EDITOR" | "ADMIN";
  createdAt: string;
  image: string | null;
}

const roleVariant = {
  ADMIN: "danger",
  EDITOR: "warning",
  USER: "muted",
} as const;

export default function UserManager() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      setItems(json.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id: string, role: User["role"]) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(typeof json.error === "string" ? json.error : "Failed");
      return;
    }
    toast.success("Role updated");
    load();
  };

  const remove = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/users/${deleteTarget.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Delete failed");
      return;
    }
    toast.success("User deleted");
    setDeleteTarget(null);
    load();
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage platform accounts and permissions."
      />

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Users} title="No users" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(u.name ?? u.email)}
                      </div>
                      <div>
                        <p className="font-medium">{u.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={u.role}
                      onChange={(e) =>
                        changeRole(u.id, e.target.value as User["role"])
                      }
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                    >
                      <option value="USER">USER</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setDeleteTarget(u)}
                      className="rounded-md p-2 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete user?"
        message={`This will permanently delete ${deleteTarget?.email}.`}
        destructive
        confirmLabel="Delete"
        onConfirm={remove}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}