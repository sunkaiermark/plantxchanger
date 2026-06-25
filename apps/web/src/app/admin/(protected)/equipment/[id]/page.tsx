import { notFound } from "next/navigation";
import { AdminEquipmentForm } from "@/components/admin/admin-equipment-form";
import { getPostgresSql } from "@/lib/postgres/client";
import { getAdminEquipmentById, listAdminCategories } from "@/lib/postgres/catalog";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function EditEquipmentPage({ params }: PageProps) {
  const { id } = await params;
  const sql = getPostgresSql();
  const [equipment, categories] = await Promise.all([
    getAdminEquipmentById(sql, id),
    listAdminCategories(sql),
  ]);

  if (!equipment) {
    notFound();
  }

  return (
    <section className="admin-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">{equipment.reference}</p>
          <h1>Edit equipment</h1>
        </div>
      </div>
      <AdminEquipmentForm equipment={equipment} categories={categories} />
    </section>
  );
}
