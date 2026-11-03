import AdminSidebar from "@/components/admin/AdminSidebar";

// Admin pages must always reflect the current database. Segment config
// cascades, so this covers every route under (dashboard).
export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
