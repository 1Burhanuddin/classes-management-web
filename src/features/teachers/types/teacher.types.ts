import type { Teacher } from "@/generated/prisma/client";

export type TeacherListItem = Teacher & {
  user: {
    id: string;
    email: string;
    role: "ADMIN" | "TEACHER" | "STUDENT";
  };
  _count: {
    batches: number;
  };
};

export type PaginatedTeachers = {
  teachers: TeacherListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
