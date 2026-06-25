"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { InquirySummary, QuoteStatus } from "@/lib/strapi/types";

type AdminInquiryStatusFormProps = {
  inquiry: InquirySummary;
};

const statusOptions: QuoteStatus[] = ["new", "contacted", "qualified", "negotiating", "closed", "spam"];

export function AdminInquiryStatusForm({ inquiry }: AdminInquiryStatusFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      status: String(form.get("status") ?? inquiry.status),
      internalNote:
        typeof form.get("internalNote") === "string" && String(form.get("internalNote")).trim()
          ? String(form.get("internalNote")).trim()
          : undefined,
    };

    const response = await fetch(`/api/admin/inquiries/${inquiry.documentId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    setIsSaving(false);

    if (!response.ok) {
      setMessage(data?.error ?? "Could not update inquiry.");
      return;
    }

    setMessage("Updated.");
    router.refresh();
  }

  return (
    <form className="admin-inquiry-form" onSubmit={submit}>
      <select name="status" defaultValue={inquiry.status}>
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <textarea
        name="internalNote"
        defaultValue={inquiry.internalNote}
        rows={3}
        maxLength={2000}
        placeholder="Internal note"
      />
      <button className="admin-button admin-button-compact" type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Update"}
      </button>
      {message ? <p className="admin-message">{message}</p> : null}
    </form>
  );
}
