import type { Role } from "@/generated/prisma/enums";

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
};

export function canAccessRole(userRole: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(userRole);
}
