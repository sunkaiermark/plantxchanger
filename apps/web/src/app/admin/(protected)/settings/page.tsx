import { AdminSettingsForm } from "@/components/admin/admin-settings-form";
import { getPostgresSql } from "@/lib/postgres/client";
import { getSiteSettingsFromPostgres } from "@/lib/postgres/catalog";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettingsFromPostgres(getPostgresSql());

  return (
    <section className="admin-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Global content</p>
          <h1>Settings</h1>
        </div>
      </div>
      <AdminSettingsForm settings={settings} />
    </section>
  );
}
