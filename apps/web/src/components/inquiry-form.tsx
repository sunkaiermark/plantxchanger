"use client";

import { useState } from "react";
import type { EquipmentSummary } from "@/lib/strapi/types";

type FormState = "idle" | "submitting" | "success" | "error";

export function InquiryForm({ equipment }: { equipment: EquipmentSummary }) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inquiryType: "buyer",
        relatedEquipmentDocumentId: equipment.documentId,
        equipmentReferenceSnapshot: equipment.reference,
        equipmentTitleSnapshot: equipment.title,
        name: formData.get("name"),
        company: formData.get("company"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        whatsapp: formData.get("whatsapp"),
        country: formData.get("country"),
        message: formData.get("message"),
        sourcePage: `/equipment/${equipment.slug}`,
        website: formData.get("website"),
      }),
    });

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setState("error");
      setMessage(payload?.message ?? "Please contact us by email or WhatsApp.");
      return;
    }

    form.reset();
    setState("success");
    setMessage("Inquiry saved. We will review the equipment details and reply.");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 border border-[#dedede] bg-white p-5">
      <input className="hidden" tabIndex={-1} autoComplete="off" name="website" />
      <div>
        <h2 className="text-2xl font-black uppercase text-[#202329]">Request availability</h2>
        <p className="mt-2 font-mono text-sm text-[#777a7d]">
          Saved to the inquiry database and linked to {equipment.reference}.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required name="name" placeholder="Name" className="border border-[#d7d7d7] px-3 py-3 font-mono outline-none focus:border-[#ff3d00]" />
        <input name="company" placeholder="Company" className="border border-[#d7d7d7] px-3 py-3 font-mono outline-none focus:border-[#ff3d00]" />
        <input name="email" type="email" placeholder="Email" className="border border-[#d7d7d7] px-3 py-3 font-mono outline-none focus:border-[#ff3d00]" />
        <input name="whatsapp" placeholder="WhatsApp" className="border border-[#d7d7d7] px-3 py-3 font-mono outline-none focus:border-[#ff3d00]" />
        <input name="phone" placeholder="Phone" className="border border-[#d7d7d7] px-3 py-3 font-mono outline-none focus:border-[#ff3d00]" />
        <input name="country" placeholder="Country" className="border border-[#d7d7d7] px-3 py-3 font-mono outline-none focus:border-[#ff3d00]" />
      </div>
      <textarea
        required
        name="message"
        rows={5}
        defaultValue={`Please send availability and quote details for ${equipment.reference}.`}
        className="border border-[#d7d7d7] px-3 py-3 font-mono outline-none focus:border-[#ff3d00]"
      />
      <button
        disabled={state === "submitting"}
        className="h-12 bg-[#ff3d00] px-5 font-mono font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#e53600] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "submitting" ? "Sending..." : "Save inquiry"}
      </button>
      {message ? (
        <p className={`font-mono text-sm ${state === "success" ? "text-[#0a7c3b]" : "text-[#9b2c2c]"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
