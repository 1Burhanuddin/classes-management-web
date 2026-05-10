import type { Assignment, Role } from "@/generated/prisma/client";

export type AssignmentActor = {
  id: string;
  role: Role;
};

export type AssignmentListItem = Assignment & {
  batch: {
    id: string;
    name: string;
    teacherId: string | null;
    class: {
      id: string;
      name: string;
    };
  };
};

export type PaginatedAssignments = {
  assignments: AssignmentListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
