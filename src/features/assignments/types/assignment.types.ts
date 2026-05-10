import type { Assignment, Role } from "@/generated/prisma/client";

export type AssignmentActor = {
  id: string;
  role: Role;
};

type AssignmentTransport = Omit<Assignment, "createdAt" | "dueDate" | "updatedAt"> & {
  createdAt: string;
  dueDate: string | null;
  updatedAt: string;
};

export type AssignmentListItem = AssignmentTransport & {
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
