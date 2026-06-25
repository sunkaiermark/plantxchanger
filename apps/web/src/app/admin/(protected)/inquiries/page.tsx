import { AdminInquiryStatusForm } from "@/components/admin/admin-inquiry-status-form";
import { getAdminInquiriesFromPostgres } from "@/lib/postgres/inquiries";
import type { QuoteStatus } from "@/lib/strapi/types";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    inquiryType?: string;
    search?: string;
  }>;
};

const statuses = new Set(["new", "contacted", "qualified", "negotiating", "closed", "spam"]);
const inquiryTypes = new Set(["buyer", "seller"]);

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = {
    status: statuses.has(params.status ?? "") ? (params.status as QuoteStatus) : undefined,
    inquiryType: inquiryTypes.has(params.inquiryType ?? "")
      ? (params.inquiryType as "buyer" | "seller")
      : undefined,
    search: params.search,
  };
  const inquiries = await getAdminInquiriesFromPostgres(filters);

  return (
    <section className="admin-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">{inquiries.length} visible</p>
          <h1>Inquiries</h1>
        </div>
      </div>

      <form className="admin-filter-bar">
        <label>
          Status
          <select name="status" defaultValue={filters.status ?? ""}>
            <option value="">All</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="negotiating">Negotiating</option>
            <option value="closed">Closed</option>
            <option value="spam">Spam</option>
          </select>
        </label>
        <label>
          Type
          <select name="inquiryType" defaultValue={filters.inquiryType ?? ""}>
            <option value="">All</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </label>
        <label>
          Search
          <input name="search" defaultValue={filters.search ?? ""} placeholder="Name, company, ref" />
        </label>
        <button className="admin-button" type="submit">
          Filter
        </button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table admin-table-top">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Equipment</th>
              <th>Message</th>
              <th>Created</th>
              <th>Status / note</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.documentId}>
                <td>
                  <strong>{inquiry.name}</strong>
                  <span>{inquiry.company ?? inquiry.country ?? inquiry.inquiryType}</span>
                  <span>{inquiry.email ?? inquiry.phone ?? inquiry.whatsapp ?? "-"}</span>
                </td>
                <td>
                  <strong>{inquiry.equipmentReferenceSnapshot ?? "-"}</strong>
                  <span>{inquiry.equipmentTitleSnapshot ?? inquiry.sourcePage ?? "-"}</span>
                </td>
                <td>{inquiry.message}</td>
                <td>{inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : "-"}</td>
                <td>
                  <AdminInquiryStatusForm inquiry={inquiry} />
                </td>
              </tr>
            ))}
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={5}>No inquiries match these filters.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
