"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function SellEquipmentForm() {
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
        inquiryType: "seller",
        name: formData.get("name"),
        company: formData.get("company"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        whatsapp: formData.get("whatsapp"),
        country: formData.get("country"),
        message: formData.get("message"),
        sourcePage: "/sell",
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
    setMessage("Seller inquiry saved. We will review the asset details.");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-[#d8ded8] bg-white p-5">
      <input className="hidden" tabIndex={-1} autoComplete="off" name="website" />
      <div className="grid gap-3 sm:grid-cols-2">
        <input required name="name" placeholder="Name" className="rounded-lg border border-[#cfd8d2] px-3 py-3" />
        <input name="company" placeholder="Company" className="rounded-lg border border-[#cfd8d2] px-3 py-3" />
        <input name="email" type="email" placeholder="Email" className="rounded-lg border border-[#cfd8d2] px-3 py-3" />
        <input name="whatsapp" placeholder="WhatsApp" className="rounded-lg border border-[#cfd8d2] px-3 py-3" />
        <input name="phone" placeholder="Phone" className="rounded-lg border border-[#cfd8d2] px-3 py-3" />
        <input name="country" placeholder="Equipment country" className="rounded-lg border border-[#cfd8d2] px-3 py-3" />
      </div>
      <textarea
        required
        name="message"
        rows={6}
        placeholder="Describe equipment type, condition, year, location, documents, photos, and expected selling timeline."
        className="rounded-lg border border-[#cfd8d2] px-3 py-3"
      />
      <button
        disabled={state === "submitting"}
        className="h-12 rounded-lg bg-[#17463a] px-5 font-semibold text-white transition hover:bg-[#27566b] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "submitting" ? "Sending..." : "Submit equipment lead"}
      </button>
      {message ? (
        <p className={`text-sm ${state === "success" ? "text-[#17463a]" : "text-[#9b2c2c]"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
