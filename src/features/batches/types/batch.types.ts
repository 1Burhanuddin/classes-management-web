import type { Batch } from "@/generated/prisma/client";

export type BatchListItem = Batch & {
  class: {
    id: string;
    name: string;
  };
  teacher: {
    id: string;
    specialization: string | null;
    user: {
      id: string;
      email: string;
    };
  } | null;
  _count: {
    students: number;
    assignments: number;
    announcements: number;
    attendances: number;
  };
};

export type PaginatedBatches = {
  batches: BatchListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
