import type { Announcement, Role } from "@/generated/prisma/client";

export type AnnouncementActor = {
  id: string;
  role: Role;
};

type AnnouncementTransport = Omit<Announcement, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type AnnouncementListItem = AnnouncementTransport & {
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

export type PaginatedAnnouncements = {
  announcements: AnnouncementListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
