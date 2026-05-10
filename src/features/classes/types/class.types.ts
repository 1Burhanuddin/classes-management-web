import type { Class } from "@/generated/prisma/client";

export type ClassListItem = Class & {
  _count: {
    batches: number;
  };
};

export type PaginatedClasses = {
  classes: ClassListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
