import { getCurrentUser } from "@/lib/auth";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If no admin session (such as on /admin/login), render children without admin chrome
  if (!user || user.role !== "ADMIN") {
    return <>{children}</>;
  }

  return (
    <AdminLayoutClient
      adminUser={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
    >
      {children}
    </AdminLayoutClient>
  );
}
