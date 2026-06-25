"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json().catch(() => null);

    setIsSaving(false);
    if (!response.ok) {
      setMessage(data?.error ?? "Invalid password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="admin-login">
      <form className="admin-login-form" onSubmit={submit}>
        <div>
          <p className="admin-eyebrow">PlantXchange CMS</p>
          <h1>Admin login</h1>
        </div>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {message ? (
          <p className="admin-message admin-message-error" role="alert">
            {message}
          </p>
        ) : null}
        <button className="admin-button" type="submit" disabled={isSaving}>
          {isSaving ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
