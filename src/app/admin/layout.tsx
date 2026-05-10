import type { Role } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth";

const allowedRoles: Role[] = ["ADMIN"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(allowedRoles);

  return children;
}
