"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { optionalString } from "@/lib/admin/form-utils";
import type { AdminCategoryInput } from "@/lib/admin/validation";
import type { CategorySummary } from "@/lib/strapi/types";
import { AdminDeleteButton } from "./admin-delete-button";

type AdminCategoryFormProps = {
  category?: CategorySummary;
};

export function AdminCategoryForm({ category }: AdminCategoryFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload: AdminCategoryInput = {
      name: String(form.get("name") ?? ""),
      slug: String(form.get("slug") ?? ""),
      description: optionalString(form.get("description")),
      imageUrl: optionalString(form.get("imageUrl")),
      sortOrder: Number(form.get("sortOrder") ?? 0),
      seoTitle: optionalString(form.get("seoTitle")),
      seoDescription: optionalString(form.get("seoDescription")),
    };

    const response = await fetch(
      category ? `/api/admin/categories/${category.documentId}` : "/api/admin/categories",
      {
        method: category ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await response.json().catch(() => null);
    setIsSaving(false);

    if (!response.ok) {
      setMessage(data?.error ?? "Could not save category.");
      return;
    }

    setMessage("Category saved.");
    router.refresh();
    if (!category) event.currentTarget.reset();
  }

  return (
    <form className={category ? "admin-inline-form" : "admin-form"} onSubmit={submit}>
      <div className="admin-form-grid">
        <label>
          Name
          <input name="name" defaultValue={category?.name} required maxLength={120} />
        </label>
        <label>
          Slug
          <input name="slug" defaultValue={category?.slug} required maxLength={220} />
        </label>
        <label>
          Sort order
          <input name="sortOrder" type="number" min="0" max="10000" defaultValue={category?.sortOrder ?? 0} />
        </label>
        <label>
          Image URL
          <input name="imageUrl" defaultValue={category?.imageUrl} maxLength={500} />
        </label>
      </div>
      <label>
        Description
        <textarea name="description" defaultValue={category?.description} rows={2} maxLength={600} />
      </label>
      <div className="admin-form-grid">
        <label>
          SEO title
          <input name="seoTitle" defaultValue={category?.seoTitle} maxLength={160} />
        </label>
        <label>
          SEO description
          <input name="seoDescription" defaultValue={category?.seoDescription} maxLength={260} />
        </label>
      </div>
      {message ? <p className="admin-message">{message}</p> : null}
      <div className="admin-actions">
        <button className="admin-button" type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : category ? "Save" : "Create category"}
        </button>
        {category ? (
          <AdminDeleteButton
            endpoint={`/api/admin/categories/${category.documentId}`}
            label="Delete"
            confirmMessage={`Delete ${category.name}? Equipment in this category will become unassigned.`}
          />
        ) : null}
      </div>
    </form>
  );
}
