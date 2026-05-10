import { describe, expect, it, vi } from "vitest";
import { AttendanceStatus, Role } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api-errors";
import { createAttendanceService, type AttendanceServiceDb } from "./attendance.service-core";

const attendanceId = "11111111-1111-4111-8111-111111111111";
const studentId = "22222222-2222-4222-8222-222222222222";
const batchId = "33333333-3333-4333-8333-333333333333";
const teacherId = "44444444-4444-4444-8444-444444444444";
const userId = "55555555-5555-4555-8555-555555555555";
const date = new Date("2026-05-10T00:00:00.000Z");

const adminActor = { id: userId, role: Role.ADMIN };
const teacherActor = { id: userId, role: Role.TEACHER };
const studentActor = { id: userId, role: Role.STUDENT };

function createAttendance(overrides = {}) {
  return {
    id: attendanceId,
    studentId,
    batchId,
    status: AttendanceStatus.PRESENT,
    remarks: null,
    date,
    batch: {
      id: batchId,
      name: "Morning Batch",
      teacherId,
      class: {
        id: "66666666-6666-4666-8666-666666666666",
        name: "Grade 10",
      },
    },
    student: {
      id: studentId,
      fullName: "Amina Khan",
    },
    ...overrides,
  };
}

function createMockDb(overrides: Partial<AttendanceServiceDb> = {}) {
  const db = {
    attendance: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve(createAttendance(data))),
      delete: vi.fn().mockResolvedValue({ id: attendanceId }),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(createAttendance()),
      update: vi.fn().mockImplementation(({ data }) => Promise.resolve(createAttendance(data))),
    },
    batch: {
      findUnique: vi.fn().mockResolvedValue({ id: batchId, teacherId }),
    },
    student: {
      findUnique: vi.fn().mockResolvedValue({ id: studentId, batchId }),
    },
    teacher: {
      findUnique: vi.fn().mockResolvedValue({ id: teacherId, batches: [{ id: batchId }] }),
    },
    ...overrides,
  };

  return db as unknown as AttendanceServiceDb;
}

describe("attendance service", () => {
  it("allows admin to create attendance", async () => {
    const db = createMockDb({
      attendance: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve(createAttendance(data))),
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as Partial<AttendanceServiceDb>);
    const service = createAttendanceService(db);

    const attendance = await service.createAttendance(adminActor, {
      studentId,
      batchId,
      status: AttendanceStatus.PRESENT,
      date,
    });

    expect(attendance).toMatchObject({
      studentId,
      batchId,
      status: AttendanceStatus.PRESENT,
    });
  });

  it("allows assigned teacher to create attendance", async () => {
    const db = createMockDb({
      attendance: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve(createAttendance(data))),
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as Partial<AttendanceServiceDb>);
    const service = createAttendanceService(db);

    await expect(
      service.createAttendance(teacherActor, {
        studentId,
        batchId,
        status: AttendanceStatus.LATE,
        date,
      }),
    ).resolves.toMatchObject({ status: AttendanceStatus.LATE });
  });

  it("rejects teacher managing an unassigned batch", async () => {
    const db = createMockDb({
      teacher: {
        findUnique: vi.fn().mockResolvedValue({ id: teacherId, batches: [] }),
      },
    } as Partial<AttendanceServiceDb>);
    const service = createAttendanceService(db);

    await expect(
      service.createAttendance(teacherActor, {
        studentId,
        batchId,
        status: AttendanceStatus.PRESENT,
        date,
      }),
    ).rejects.toMatchObject(new ApiError(403, "Teacher cannot manage this batch"));
  });

  it("rejects student write access", async () => {
    const db = createMockDb();
    const service = createAttendanceService(db);

    await expect(
      service.createAttendance(studentActor, {
        studentId,
        batchId,
        status: AttendanceStatus.PRESENT,
        date,
      }),
    ).rejects.toMatchObject(new ApiError(403, "Forbidden"));
  });

  it("rejects attendance when student does not belong to batch", async () => {
    const db = createMockDb({
      attendance: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      student: {
        findUnique: vi.fn().mockResolvedValue({ id: studentId, batchId: "77777777-7777-4777-8777-777777777777" }),
      },
    } as Partial<AttendanceServiceDb>);
    const service = createAttendanceService(db);

    await expect(
      service.createAttendance(adminActor, {
        studentId,
        batchId,
        status: AttendanceStatus.PRESENT,
        date,
      }),
    ).rejects.toMatchObject(new ApiError(400, "Student does not belong to batch"));
  });

  it("rejects duplicate attendance for the same student, batch, and date", async () => {
    const db = createMockDb();
    const service = createAttendanceService(db);

    await expect(
      service.createAttendance(adminActor, {
        studentId,
        batchId,
        status: AttendanceStatus.PRESENT,
        date,
      }),
    ).rejects.toMatchObject(new ApiError(409, "Attendance already exists for this student, batch, and date"));
  });

  it("limits student list access to their own attendance", async () => {
    const db = createMockDb({
      attendance: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([createAttendance()]),
      },
    } as Partial<AttendanceServiceDb>);
    const service = createAttendanceService(db);

    const result = await service.listAttendance(studentActor, {
      page: 1,
      pageSize: 20,
    });

    expect(result.pagination.total).toBe(1);
    expect(db.attendance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          studentId,
          batchId,
        }),
      }),
    );
  });

  it("rejects student reading another student's attendance", async () => {
    const db = createMockDb({
      attendance: {
        findUnique: vi.fn().mockResolvedValue(createAttendance({ studentId: "88888888-8888-4888-8888-888888888888" })),
      },
    } as Partial<AttendanceServiceDb>);
    const service = createAttendanceService(db);

    await expect(service.getAttendance(studentActor, attendanceId)).rejects.toMatchObject(new ApiError(403, "Forbidden"));
  });
});
