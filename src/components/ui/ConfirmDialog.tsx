"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "./Modal";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  destructive,
  onConfirm,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-outline" disabled={loading}>
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className={
            destructive
              ? "inline-flex items-center rounded-lg bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              : "btn-primary"
          }
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}