import type { Fee, Role } from "@/generated/prisma/client";

export type FeeActor = {
  id: string;
  role: Role;
};

type FeeTransport = Omit<Fee, "createdAt" | "dueDate" | "paidAt" | "updatedAt"> & {
  createdAt: string;
  dueDate: string;
  paidAt: string | null;
  updatedAt: string;
};

export type FeeListItem = FeeTransport & {
  student: {
    id: string;
    fullName: string;
    batch: {
      id: string;
      name: string;
      class: {
        id: string;
        name: string;
      };
    };
  };
};

export type PaginatedFees = {
  fees: FeeListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
