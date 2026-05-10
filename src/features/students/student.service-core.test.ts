import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-errors";
import { createStudentService, type StudentServiceDb } from "./student.service-core";

const batchId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";
const studentId = "33333333-3333-4333-8333-333333333333";

function createMockDb(overrides: Record<string, unknown> = {}) {
  const db = {
    batch: {
      findUnique: vi.fn().mockResolvedValue({ id: batchId }),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: userId, student: null }),
    },
    student: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: studentId, ...data })),
      delete: vi.fn().mockResolvedValue({ id: studentId }),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue({ id: studentId, fullName: "Amina Khan", batchId }),
      update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: studentId, ...data })),
    },
    ...overrides,
  };

  return db as unknown as StudentServiceDb;
}

describe("student service", () => {
  it("creates a student when batch exists", async () => {
    const db = createMockDb();
    const service = createStudentService(db);

    const student = await service.createStudent({
      fullName: "Amina Khan",
      batchId,
    });

    expect(student).toMatchObject({
      id: studentId,
      fullName: "Amina Khan",
      batchId,
    });
    expect(db.batch.findUnique).toHaveBeenCalledWith({
      where: { id: batchId },
      select: { id: true },
    });
  });

  it("rejects create when batch does not exist", async () => {
    const db = createMockDb({
      batch: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    });
    const service = createStudentService(db);

    await expect(
      service.createStudent({
        fullName: "Amina Khan",
        batchId,
      }),
    ).rejects.toMatchObject(new ApiError(404, "Batch not found"));
  });

  it("rejects linking a missing user", async () => {
    const db = createMockDb({
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    });
    const service = createStudentService(db);

    await expect(
      service.createStudent({
        fullName: "Amina Khan",
        batchId,
        userId,
      }),
    ).rejects.toMatchObject(new ApiError(404, "User not found"));
  });

  it("rejects linking a user already assigned to another student", async () => {
    const db = createMockDb({
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: userId, student: { id: "44444444-4444-4444-8444-444444444444" } }),
      },
    });
    const service = createStudentService(db);

    await expect(
      service.createStudent({
        fullName: "Amina Khan",
        batchId,
        userId,
      }),
    ).rejects.toMatchObject(new ApiError(409, "User is already linked to another student"));
  });

  it("calculates pagination and caps query shape in list calls", async () => {
    const db = createMockDb({
      student: {
        count: vi.fn().mockResolvedValue(45),
        findMany: vi.fn().mockResolvedValue([]),
      },
    });
    const service = createStudentService(db);

    const result = await service.listStudents({
      page: 2,
      pageSize: 20,
      search: "amina",
    });

    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 20,
      total: 45,
      totalPages: 3,
    });
    expect(db.student.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 20,
      }),
    );
  });
});
