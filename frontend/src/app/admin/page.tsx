import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminCookie } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  const raw = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!verifyAdminCookie(raw)) {
    redirect("/admin/signin");
  }

  return <AdminDashboard />;
}
