"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function detail(label: string, rawValue: string) {
  return rawValue ? `${label}: ${rawValue}` : null;
}

export function SellEquipmentForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const equipmentTitle = value(formData, "equipmentTitle");
    const makeModel = [value(formData, "make"), value(formData, "model")].filter(Boolean).join(" ");
    const listingMessage = [
      detail("Equipment", equipmentTitle),
      detail("Category", value(formData, "category")),
      detail("Condition", value(formData, "condition")),
      detail("Make/model", makeModel),
      detail("Year", value(formData, "year")),
      detail("Serial number", value(formData, "serialNumber")),
      detail("Operating hours", value(formData, "operatingHours")),
      detail("Weight", value(formData, "weight")),
      detail("Dimensions", value(formData, "dimensions")),
      detail("Asking price", value(formData, "price")),
      detail("Location", value(formData, "country")),
      detail("Notes", value(formData, "notes")),
    ]
      .filter(Boolean)
      .join("\n");

    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inquiryType: "seller",
        equipmentTitleSnapshot: equipmentTitle,
        name: formData.get("name"),
        company: formData.get("company"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        whatsapp: formData.get("whatsapp"),
        country: formData.get("country"),
        message: listingMessage,
        sourcePage: "/sell",
        website: formData.get("website"),
      }),
    });

    const payload = (await response.json().catch(() => null)) as {
      inquiry?: { documentId?: string; status?: string };
      message?: string;
    } | null;

    if (!response.ok) {
      setState("error");
      setMessage(payload?.message ?? "Please contact us by email or WhatsApp.");
      return;
    }

    form.reset();
    setState("success");
    setMessage(
      payload?.inquiry?.documentId
        ? `Listing intake ${payload.inquiry.documentId} saved as ${payload.inquiry.status ?? "pending"}.`
        : "Listing intake saved as pending. We will review the asset before publishing.",
    );
  }

  const inputClass =
    "border border-[#d7d7d7] bg-white px-3 py-3 font-mono outline-none focus:border-[#ff3d00]";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 border border-[#dedede] bg-white p-6 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
      <input className="hidden" tabIndex={-1} autoComplete="off" name="website" />
      <div>
        <h2 className="text-2xl font-black uppercase text-[#202329]">Post a listing</h2>
        <p className="mt-2 font-mono text-sm leading-6 text-[#777a7d]">
          Submit technical details, price expectations, and contact information for qualification.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input required name="equipmentTitle" placeholder="Equipment title" className={`${inputClass} sm:col-span-2`} />
        <select required name="category" className={inputClass} defaultValue="">
          <option value="" disabled>
            Category
          </option>
          <option>Chemical Plant</option>
          <option>Reactors</option>
          <option>Mixers & Agitators</option>
          <option>Tanks & Vessels</option>
          <option>Compressors & Pumps</option>
          <option>Cranes</option>
          <option>Excavators & Loaders</option>
          <option>Oil & Gas</option>
        </select>
        <select required name="condition" className={inputClass} defaultValue="">
          <option value="" disabled>
            Condition
          </option>
          <option>Excellent</option>
          <option>Good</option>
          <option>Fair</option>
          <option>For parts</option>
        </select>
        <input name="make" placeholder="Make" className={inputClass} />
        <input name="model" placeholder="Model" className={inputClass} />
        <input name="year" placeholder="Year" className={inputClass} />
        <input name="serialNumber" placeholder="Serial number" className={inputClass} />
        <input name="operatingHours" placeholder="Operating hours" className={inputClass} />
        <input name="weight" placeholder="Weight" className={inputClass} />
        <input name="dimensions" placeholder="Dimensions" className={inputClass} />
        <input name="price" placeholder="Asking price or price on request" className={inputClass} />
      </div>

      <textarea
        required
        name="notes"
        rows={5}
        placeholder="Describe documents, photos, inspection availability, relocation status, and selling timeline."
        className={`${inputClass} resize-y`}
      />

      <div className="grid gap-3 border-t border-[#eeeeee] pt-5 sm:grid-cols-2">
        <input required name="name" placeholder="Name" className={inputClass} />
        <input name="company" placeholder="Company" className={inputClass} />
        <input name="email" type="email" placeholder="Email" className={inputClass} />
        <input name="whatsapp" placeholder="WhatsApp" className={inputClass} />
        <input name="phone" placeholder="Phone" className={inputClass} />
        <input name="country" placeholder="Equipment country" className={inputClass} />
      </div>

      <button
        disabled={state === "submitting"}
        className="h-14 bg-[#ff3d00] px-5 font-mono font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#e53600] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "submitting" ? "Sending..." : "Submit listing"}
      </button>
      {message ? (
        <p className={`font-mono text-sm ${state === "success" ? "text-[#0a7c3b]" : "text-[#9b2c2c]"}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
