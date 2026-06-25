import Link from "next/link";
import { BarChart3, Database, FilePlus2, Inbox, Settings } from "lucide-react";
import { AdminSeedForm } from "@/components/admin/admin-seed-form";
import { getPostgresSql } from "@/lib/postgres/client";
import { getAdminDashboardStats } from "@/lib/postgres/catalog";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats(getPostgresSql());

  return (
    <section className="admin-stack">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">CMS overview</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat">
          <Database size={18} aria-hidden="true" />
          <span>Total equipment</span>
          <strong>{stats.totalEquipment}</strong>
        </div>
        <div className="admin-stat">
          <BarChart3 size={18} aria-hidden="true" />
          <span>Published</span>
          <strong>{stats.publishedEquipment}</strong>
        </div>
        <div className="admin-stat">
          <FilePlus2 size={18} aria-hidden="true" />
          <span>Featured</span>
          <strong>{stats.featuredEquipment}</strong>
        </div>
        <div className="admin-stat">
          <Inbox size={18} aria-hidden="true" />
          <span>New inquiries</span>
          <strong>{stats.newInquiries}</strong>
        </div>
      </div>

      <section className="admin-panel">
        <h2>Quick actions</h2>
        <div className="admin-actions">
          <Link className="admin-button" href="/admin/equipment/new">
            <FilePlus2 size={16} aria-hidden="true" />
            New equipment
          </Link>
          <Link className="admin-button admin-button-secondary" href="/admin/inquiries">
            <Inbox size={16} aria-hidden="true" />
            Review inquiries
          </Link>
          <Link className="admin-button admin-button-secondary" href="/admin/settings">
            <Settings size={16} aria-hidden="true" />
            Site settings
          </Link>
        </div>
      </section>

      <AdminSeedForm />
    </section>
  );
}
