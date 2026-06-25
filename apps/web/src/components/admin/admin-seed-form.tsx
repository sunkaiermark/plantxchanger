"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Database } from "lucide-react";

export function AdminSeedForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function seed() {
    setIsSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/seed", { method: "POST" });
    const data = await response.json().catch(() => null);
    setIsSaving(false);
    setMessage(response.ok ? "Sample catalog imported." : data?.error ?? "Import failed.");
    if (response.ok) router.refresh();
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <Database size={18} aria-hidden="true" />
        <h2>Seed catalog</h2>
      </div>
      <p>Import the checked-in sample equipment, categories, and default settings into Postgres.</p>
      <button className="admin-button admin-button-secondary" type="button" onClick={seed} disabled={isSaving}>
        {isSaving ? "Importing..." : "Import sample catalog"}
      </button>
      {message ? <p className="admin-message">{message}</p> : null}
    </section>
  );
}
