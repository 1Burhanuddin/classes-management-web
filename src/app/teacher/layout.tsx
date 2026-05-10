import type { Role } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth";

const allowedRoles: Role[] = ["ADMIN", "TEACHER"];

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireRole(allowedRoles);

  return children;
}
