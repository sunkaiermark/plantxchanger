"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

type AdminDeleteButtonProps = {
  endpoint: string;
  label: string;
  confirmMessage: string;
};

export function AdminDeleteButton({ endpoint, label, confirmMessage }: AdminDeleteButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function remove() {
    if (!window.confirm(confirmMessage)) return;

    setIsSaving(true);
    setMessage("");
    const response = await fetch(endpoint, { method: "DELETE" });
    const data = await response.json().catch(() => null);
    setIsSaving(false);

    if (!response.ok) {
      setMessage(data?.error ?? "Delete failed.");
      return;
    }

    router.refresh();
  }

  return (
    <span className="admin-delete-wrap">
      <button className="admin-icon-button admin-danger" type="button" onClick={remove} disabled={isSaving}>
        <Trash2 size={15} aria-hidden="true" />
        {isSaving ? "Deleting" : label}
      </button>
      {message ? <span className="admin-inline-error">{message}</span> : null}
    </span>
  );
}
