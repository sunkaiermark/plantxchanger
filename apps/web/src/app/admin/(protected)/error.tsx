"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="admin-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">CMS temporary issue</p>
          <h1>Database connection interrupted</h1>
        </div>
      </div>
      <section className="admin-panel admin-error-panel">
        <AlertTriangle size={24} aria-hidden="true" />
        <div>
          <h2>Neon is waking up or briefly unavailable.</h2>
          <p>
            Wait a few seconds, then retry this admin page. Public catalog pages remain available
            from cached and fallback catalog data.
          </p>
          <button className="admin-button" type="button" onClick={reset}>
            <RefreshCw size={16} aria-hidden="true" />
            Retry
          </button>
        </div>
      </section>
    </section>
  );
}
