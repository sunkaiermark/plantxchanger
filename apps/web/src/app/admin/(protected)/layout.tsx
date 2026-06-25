import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin/session";
import { getRequiredServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "PlantXchange Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const result = token
    ? verifyAdminSessionToken(token, {
        secret: getRequiredServerEnv("ADMIN_SESSION_SECRET"),
      })
    : { valid: false as const, reason: "format" as const };

  if (!result.valid) {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
