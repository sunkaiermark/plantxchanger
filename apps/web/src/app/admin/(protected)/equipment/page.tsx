import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { getPostgresSql } from "@/lib/postgres/client";
import { listAdminEquipment } from "@/lib/postgres/catalog";

export const dynamic = "force-dynamic";

export default async function AdminEquipmentPage() {
  const equipment = await listAdminEquipment(getPostgresSql());

  return (
    <section className="admin-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">{equipment.length} records</p>
          <h1>Equipment</h1>
        </div>
        <Link className="admin-button" href="/admin/equipment/new">
          <Plus size={16} aria-hidden="true" />
          New equipment
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Reference</th>
              <th>Category</th>
              <th>Status</th>
              <th>Location</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item) => (
              <tr key={item.documentId}>
                <td>
                  <strong>{item.title}</strong>
                  <span>{item.slug}</span>
                </td>
                <td>{item.reference}</td>
                <td>{item.category?.name ?? "Unassigned"}</td>
                <td>
                  <span className={item.isPublished ? "admin-pill" : "admin-pill admin-pill-muted"}>
                    {item.isPublished ? "Published" : "Draft"}
                  </span>
                  {item.isFeatured ? <span className="admin-pill">Featured</span> : null}
                </td>
                <td>{[item.country, item.location].filter(Boolean).join(", ") || "-"}</td>
                <td>{item.price ? `${item.currency} ${item.price.toLocaleString()}` : "-"}</td>
                <td>
                  <div className="admin-row-actions">
                    <Link className="admin-icon-link" href={`/admin/equipment/${item.documentId}`}>
                      <Pencil size={15} aria-hidden="true" />
                      Edit
                    </Link>
                    <AdminDeleteButton
                      endpoint={`/api/admin/equipment/${item.documentId}`}
                      label="Delete"
                      confirmMessage={`Delete ${item.title}?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {equipment.length === 0 ? (
              <tr>
                <td colSpan={7}>No equipment yet. Use the seed action or create a record.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
