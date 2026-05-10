import { describe, expect, it, vi } from "vitest";
import { Role } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api-errors";
import { createAnnouncementService, type AnnouncementServiceDb } from "./announcement.service-core";

const announcementId = "11111111-1111-4111-8111-111111111111";
const batchId = "22222222-2222-4222-8222-222222222222";
const teacherId = "33333333-3333-4333-8333-333333333333";
const userId = "44444444-4444-4444-8444-444444444444";

const adminActor = { id: userId, role: Role.ADMIN };
const teacherActor = { id: userId, role: Role.TEACHER };
const studentActor = { id: userId, role: Role.STUDENT };

function createAnnouncement(overrides = {}) {
  return {
    id: announcementId,
    title: "Holiday notice",
    message: "Classes are closed tomorrow.",
    batchId,
    createdBy: userId,
    createdAt: new Date("2026-05-10T00:00:00.000Z"),
    updatedAt: new Date("2026-05-10T00:00:00.000Z"),
    batch: {
      id: batchId,
      name: "Morning Batch",
      teacherId,
      class: {
        id: "55555555-5555-4555-8555-555555555555",
        name: "Grade 10",
      },
    },
    ...overrides,
  };
}

function buildAnnouncementMocks(overrides = {}) {
  return {
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(({ data }) => Promise.resolve(createAnnouncement(data))),
    delete: vi.fn().mockResolvedValue({ id: announcementId }),
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(createAnnouncement()),
    update: vi.fn().mockImplementation(({ data }) => Promise.resolve(createAnnouncement(data))),
    ...overrides,
  };
}

function buildBatchMocks(overrides = {}) {
  return {
    findUnique: vi.fn().mockResolvedValue({ id: batchId, teacherId }),
    ...overrides,
  };
}

function buildStudentMocks(overrides = {}) {
  return {
    findUnique: vi.fn().mockResolvedValue({ id: "66666666-6666-4666-8666-666666666666", batchId }),
    ...overrides,
  };
}

function buildTeacherMocks(overrides = {}) {
  return {
    findUnique: vi.fn().mockResolvedValue({ id: teacherId, batches: [{ id: batchId }] }),
    ...overrides,
  };
}

function createMockDb(overrides: Record<string, unknown> = {}) {
  const db = {
    announcement: buildAnnouncementMocks(),
    batch: buildBatchMocks(),
    student: buildStudentMocks(),
    teacher: buildTeacherMocks(),
    ...overrides,
  };

  return db as unknown as AnnouncementServiceDb;
}

describe("announcement service", () => {
  it("allows admin to create announcements and stores the actor as creator", async () => {
    const db = createMockDb();
    const service = createAnnouncementService(db);

    const announcement = await service.createAnnouncement(adminActor, {
      title: "Holiday notice",
      message: "Classes are closed tomorrow.",
      batchId,
    });

    expect(announcement).toMatchObject({
      title: "Holiday notice",
      batchId,
      createdBy: adminActor.id,
    });
    expect(db.batch.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: batchId },
      }),
    );
  });

  it("allows assigned teachers to create announcements", async () => {
    const db = createMockDb();
    const service = createAnnouncementService(db);

    await expect(
      service.createAnnouncement(teacherActor, {
        title: "Holiday notice",
        message: "Classes are closed tomorrow.",
        batchId,
      }),
    ).resolves.toMatchObject({ batchId });
  });

  it("rejects teacher writes to unassigned batches", async () => {
    const db = createMockDb({
      teacher: buildTeacherMocks({
        findUnique: vi.fn().mockResolvedValue({ id: teacherId, batches: [] }),
      }),
    });
    const service = createAnnouncementService(db);

    await expect(
      service.createAnnouncement(teacherActor, {
        title: "Holiday notice",
        message: "Classes are closed tomorrow.",
        batchId,
      }),
    ).rejects.toMatchObject(new ApiError(403, "Teacher cannot manage this batch"));
  });

  it("rejects student write access", async () => {
    const db = createMockDb();
    const service = createAnnouncementService(db);

    await expect(
      service.createAnnouncement(studentActor, {
        title: "Holiday notice",
        message: "Classes are closed tomorrow.",
        batchId,
      }),
    ).rejects.toMatchObject(new ApiError(403, "Forbidden"));
  });

  it("limits student list access to their own batch", async () => {
    const db = createMockDb({
      announcement: buildAnnouncementMocks({
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([createAnnouncement()]),
      }),
    });
    const service = createAnnouncementService(db);

    const result = await service.listAnnouncements(studentActor, {
      page: 1,
      pageSize: 20,
    });

    expect(result.pagination.total).toBe(1);
    expect(db.student.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: studentActor.id },
      }),
    );
    expect(db.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          batchId,
        }),
      }),
    );
  });

  it("rejects student reads for another batch", async () => {
    const db = createMockDb({
      announcement: buildAnnouncementMocks({
        findUnique: vi.fn().mockResolvedValue(createAnnouncement({ batchId: "77777777-7777-4777-8777-777777777777" })),
      }),
    });
    const service = createAnnouncementService(db);

    await expect(service.getAnnouncement(studentActor, announcementId)).rejects.toMatchObject(new ApiError(403, "Forbidden"));
  });
});
