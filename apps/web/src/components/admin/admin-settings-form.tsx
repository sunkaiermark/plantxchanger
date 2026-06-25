"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { optionalString } from "@/lib/admin/form-utils";
import type { AdminSettingsInput } from "@/lib/admin/validation";
import type { SiteSettings } from "@/lib/strapi/types";

type AdminSettingsFormProps = {
  settings: SiteSettings;
};

export function AdminSettingsForm({ settings }: AdminSettingsFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload: AdminSettingsInput = {
      siteName: String(form.get("siteName") ?? ""),
      contactEmail: String(form.get("contactEmail") ?? ""),
      whatsappNumber: String(form.get("whatsappNumber") ?? ""),
      whatsappDisplayLabel: String(form.get("whatsappDisplayLabel") ?? ""),
      homepageHeadline: optionalString(form.get("homepageHeadline")),
      homepageIntro: optionalString(form.get("homepageIntro")),
      defaultSeoTitle: optionalString(form.get("defaultSeoTitle")),
      defaultSeoDescription: optionalString(form.get("defaultSeoDescription")),
      footerSummary: optionalString(form.get("footerSummary")),
    };

    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    setIsSaving(false);

    if (!response.ok) {
      setMessage(data?.error ?? "Could not save settings.");
      return;
    }

    setMessage("Settings saved.");
    router.refresh();
  }

  return (
    <form className="admin-panel admin-form" onSubmit={submit}>
      <div className="admin-form-grid">
        <label>
          Site name
          <input name="siteName" defaultValue={settings.siteName} required maxLength={120} />
        </label>
        <label>
          Contact email
          <input name="contactEmail" type="email" defaultValue={settings.contactEmail} required maxLength={180} />
        </label>
        <label>
          WhatsApp number
          <input name="whatsappNumber" defaultValue={settings.whatsappNumber} required maxLength={80} />
        </label>
        <label>
          WhatsApp label
          <input
            name="whatsappDisplayLabel"
            defaultValue={settings.whatsappDisplayLabel}
            required
            maxLength={80}
          />
        </label>
      </div>
      <label>
        Homepage headline
        <input name="homepageHeadline" defaultValue={settings.homepageHeadline} maxLength={180} />
      </label>
      <label>
        Homepage intro
        <textarea name="homepageIntro" defaultValue={settings.homepageIntro} rows={3} maxLength={500} />
      </label>
      <div className="admin-form-grid">
        <label>
          Default SEO title
          <input name="defaultSeoTitle" defaultValue={settings.defaultSeoTitle} maxLength={160} />
        </label>
        <label>
          Default SEO description
          <input name="defaultSeoDescription" defaultValue={settings.defaultSeoDescription} maxLength={260} />
        </label>
      </div>
      <label>
        Footer summary
        <textarea name="footerSummary" defaultValue={settings.footerSummary} rows={3} maxLength={600} />
      </label>
      {message ? <p className="admin-message">{message}</p> : null}
      <button className="admin-button" type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
