"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Boxes, FolderTree, Gauge, Inbox, LogOut, Settings } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/equipment", label: "Equipment", icon: Boxes },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">
          <span>PlantXchange</span>
          <small>CMS</small>
        </Link>
        <nav aria-label="Admin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                className={isActive ? "admin-nav-link admin-nav-link-active" : "admin-nav-link"}
                href={item.href}
              >
                <Icon size={16} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button className="admin-logout" type="button" onClick={logout}>
          <LogOut size={16} aria-hidden="true" />
          Log out
        </button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
