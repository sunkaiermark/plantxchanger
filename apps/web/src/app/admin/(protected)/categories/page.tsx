import { AdminCategoryForm } from "@/components/admin/admin-category-form";
import { getPostgresSql } from "@/lib/postgres/client";
import { listAdminCategories } from "@/lib/postgres/catalog";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await listAdminCategories(getPostgresSql());

  return (
    <section className="admin-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">{categories.length} categories</p>
          <h1>Categories</h1>
        </div>
      </div>

      <section className="admin-panel">
        <h2>Create category</h2>
        <AdminCategoryForm />
      </section>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Order</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.documentId}>
                <td>{category.name}</td>
                <td>{category.slug}</td>
                <td>{category.description ?? "-"}</td>
                <td>{category.sortOrder}</td>
                <td className="admin-table-form-cell">
                  <AdminCategoryForm category={category} />
                </td>
              </tr>
            ))}
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5}>No categories yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
