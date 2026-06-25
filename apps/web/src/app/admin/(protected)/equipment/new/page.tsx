import { AdminEquipmentForm } from "@/components/admin/admin-equipment-form";
import { getPostgresSql } from "@/lib/postgres/client";
import { listAdminCategories } from "@/lib/postgres/catalog";

export const dynamic = "force-dynamic";

export default async function NewEquipmentPage() {
  const categories = await listAdminCategories(getPostgresSql());

  return (
    <section className="admin-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Catalog record</p>
          <h1>New equipment</h1>
        </div>
      </div>
      <AdminEquipmentForm categories={categories} />
    </section>
  );
}
