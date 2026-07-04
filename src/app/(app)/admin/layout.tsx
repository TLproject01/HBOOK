import { requireAdminUser } from "@/lib/auth/current-user";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminUser();

  return children;
}
