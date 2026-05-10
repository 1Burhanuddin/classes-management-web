import type { Attendance, Role } from "@/generated/prisma/client";

export type AttendanceActor = {
  id: string;
  role: Role;
};

export type AttendanceListItem = Attendance & {
  student: {
    id: string;
    fullName: string;
  };
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

export type PaginatedAttendance = {
  attendance: AttendanceListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
