import type { Student } from "@/generated/prisma/client";

export type StudentListItem = Student & {
  batch: {
    id: string;
    name: string;
    class: {
      id: string;
      name: string;
    };
  };
  user: {
    id: string;
    email: string;
  } | null;
};

export type PaginatedStudents = {
  students: StudentListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
