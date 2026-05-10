import type { Role } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth";

const allowedRoles: Role[] = ["ADMIN", "STUDENT"];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRole(allowedRoles);

  return children;
}
