"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminEquipmentInput } from "@/lib/admin/validation";
import { linesToList, listToLines, optionalNumber, optionalString, specsToText, textToSpecs } from "@/lib/admin/form-utils";
import type { CategorySummary, EquipmentSummary } from "@/lib/strapi/types";

type AdminEquipmentFormProps = {
  equipment?: EquipmentSummary;
  categories: CategorySummary[];
};

const conditionOptions: AdminEquipmentInput["condition"][] = ["excellent", "good", "fair", "for-parts"];
const availabilityOptions: AdminEquipmentInput["availability"][] = ["available", "under-review", "sold"];
const currencyOptions: AdminEquipmentInput["currency"][] = ["USD", "EUR", "CNY"];

export function AdminEquipmentForm({ equipment, categories }: AdminEquipmentFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload: AdminEquipmentInput = {
      title: String(form.get("title") ?? ""),
      slug: String(form.get("slug") ?? ""),
      reference: String(form.get("reference") ?? ""),
      categoryId: optionalString(form.get("categoryId")),
      condition: String(form.get("condition") ?? "good") as AdminEquipmentInput["condition"],
      availability: String(form.get("availability") ?? "available") as AdminEquipmentInput["availability"],
      country: optionalString(form.get("country")),
      location: optionalString(form.get("location")),
      year: optionalNumber(form.get("year")),
      make: optionalString(form.get("make")),
      model: optionalString(form.get("model")),
      serialNumber: optionalString(form.get("serialNumber")),
      operatingHours: optionalString(form.get("operatingHours")),
      weight: optionalString(form.get("weight")),
      dimensions: optionalString(form.get("dimensions")),
      price: optionalNumber(form.get("price")),
      currency: String(form.get("currency") ?? "USD") as AdminEquipmentInput["currency"],
      summary: optionalString(form.get("summary")),
      description: optionalString(form.get("description")),
      specifications: textToSpecs(String(form.get("specifications") ?? "")),
      features: linesToList(String(form.get("features") ?? "")).map((text) => ({ text })),
      mainImageUrl: optionalString(form.get("mainImageUrl")),
      galleryImageUrls: linesToList(String(form.get("galleryImageUrls") ?? "")),
      sellerDisplayName: optionalString(form.get("sellerDisplayName")),
      isFeatured: form.get("isFeatured") === "on",
      isPublished: form.get("isPublished") === "on",
      seoTitle: optionalString(form.get("seoTitle")),
      seoDescription: optionalString(form.get("seoDescription")),
    };

    const response = await fetch(
      equipment ? `/api/admin/equipment/${equipment.documentId}` : "/api/admin/equipment",
      {
        method: equipment ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const data = await response.json().catch(() => null);
    setIsSaving(false);

    if (!response.ok) {
      setMessage(data?.error ?? "Could not save equipment.");
      return;
    }

    setMessage("Equipment saved.");
    router.refresh();
    if (!equipment && data?.data?.documentId) {
      router.push(`/admin/equipment/${data.data.documentId}`);
    }
  }

  return (
    <form className="admin-panel admin-form" onSubmit={submit}>
      <div className="admin-form-grid">
        <label>
          Title
          <input name="title" defaultValue={equipment?.title} required maxLength={180} />
        </label>
        <label>
          Slug
          <input name="slug" defaultValue={equipment?.slug} required maxLength={220} />
        </label>
        <label>
          Reference
          <input name="reference" defaultValue={equipment?.reference} required maxLength={80} />
        </label>
        <label>
          Category
          <select name="categoryId" defaultValue={equipment?.category?.documentId ?? ""}>
            <option value="">Unassigned</option>
            {categories.map((category) => (
              <option key={category.documentId} value={category.documentId}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Condition
          <select name="condition" defaultValue={equipment?.condition ?? "good"}>
            {conditionOptions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </label>
        <label>
          Availability
          <select name="availability" defaultValue={equipment?.availability ?? "available"}>
            {availabilityOptions.map((availability) => (
              <option key={availability} value={availability}>
                {availability}
              </option>
            ))}
          </select>
        </label>
        <label>
          Country
          <input name="country" defaultValue={equipment?.country} maxLength={120} />
        </label>
        <label>
          Location
          <input name="location" defaultValue={equipment?.location} maxLength={180} />
        </label>
        <label>
          Year
          <input name="year" type="number" min="1900" max="2100" defaultValue={equipment?.year} />
        </label>
        <label>
          Make
          <input name="make" defaultValue={equipment?.make} maxLength={120} />
        </label>
        <label>
          Model
          <input name="model" defaultValue={equipment?.model} maxLength={160} />
        </label>
        <label>
          Serial number
          <input name="serialNumber" defaultValue={equipment?.serialNumber} maxLength={120} />
        </label>
        <label>
          Operating hours
          <input name="operatingHours" defaultValue={equipment?.operatingHours} maxLength={80} />
        </label>
        <label>
          Weight
          <input name="weight" defaultValue={equipment?.weight} maxLength={120} />
        </label>
        <label>
          Dimensions
          <input name="dimensions" defaultValue={equipment?.dimensions} maxLength={180} />
        </label>
        <label>
          Price
          <input name="price" type="number" min="0" step="0.01" defaultValue={equipment?.price} />
        </label>
        <label>
          Currency
          <select name="currency" defaultValue={equipment?.currency ?? "USD"}>
            {currencyOptions.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
        <label>
          Seller
          <input name="sellerDisplayName" defaultValue={equipment?.sellerDisplayName} maxLength={180} />
        </label>
      </div>

      <label>
        Summary
        <textarea name="summary" defaultValue={equipment?.summary} rows={3} maxLength={400} />
      </label>
      <label>
        Description
        <textarea name="description" defaultValue={equipment?.description} rows={6} maxLength={4000} />
      </label>
      <label>
        Specifications
        <textarea
          name="specifications"
          defaultValue={specsToText(equipment?.specifications)}
          rows={6}
          placeholder="Capacity=20,000 L"
        />
      </label>
      <label>
        Features
        <textarea
          name="features"
          defaultValue={listToLines(equipment?.features.map((feature) => feature.text))}
          rows={5}
          placeholder="One feature per line"
        />
      </label>
      <label>
        Main image URL
        <input name="mainImageUrl" defaultValue={equipment?.mainImage?.url} maxLength={500} />
      </label>
      <label>
        Gallery image URLs
        <textarea
          name="galleryImageUrls"
          defaultValue={listToLines(equipment?.gallery.map((image) => image.url))}
          rows={4}
          placeholder="One URL per line"
        />
      </label>
      <div className="admin-form-grid">
        <label>
          SEO title
          <input name="seoTitle" defaultValue={equipment?.seoTitle} maxLength={160} />
        </label>
        <label>
          SEO description
          <input name="seoDescription" defaultValue={equipment?.seoDescription} maxLength={260} />
        </label>
      </div>
      <div className="admin-check-row">
        <label>
          <input name="isPublished" type="checkbox" defaultChecked={equipment?.isPublished ?? false} />
          Published
        </label>
        <label>
          <input name="isFeatured" type="checkbox" defaultChecked={equipment?.isFeatured ?? false} />
          Featured
        </label>
      </div>

      {message ? <p className="admin-message">{message}</p> : null}
      <div className="admin-actions">
        <button className="admin-button" type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save equipment"}
        </button>
        <Link className="admin-button admin-button-secondary" href="/admin/equipment">
          Back to list
        </Link>
      </div>
    </form>
  );
}
