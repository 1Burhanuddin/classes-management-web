import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-errors";
import { createBatchService, type BatchServiceDb } from "./batch.service-core";

const batchId = "11111111-1111-4111-8111-111111111111";
const classId = "22222222-2222-4222-8222-222222222222";
const teacherId = "33333333-3333-4333-8333-333333333333";

const emptyCount = {
  students: 0,
  assignments: 0,
  announcements: 0,
  attendances: 0,
};

function createMockDb(overrides: Record<string, unknown> = {}) {
  const db = {
    batch: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: batchId, ...data, _count: emptyCount })),
      delete: vi.fn().mockResolvedValue({ id: batchId }),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue({ id: batchId, name: "Morning Batch", classId, _count: emptyCount }),
      update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: batchId, ...data, _count: emptyCount })),
    },
    class: {
      findUnique: vi.fn().mockResolvedValue({ id: classId }),
    },
    teacher: {
      findUnique: vi.fn().mockResolvedValue({ id: teacherId }),
    },
    ...overrides,
  };

  return db as unknown as BatchServiceDb;
}

describe("batch service", () => {
  it("creates a batch when class exists", async () => {
    const db = createMockDb();
    const service = createBatchService(db);

    const batch = await service.createBatch({
      name: "Morning Batch",
      classId,
    });

    expect(batch).toMatchObject({
      id: batchId,
      name: "Morning Batch",
      classId,
    });
  });

  it("rejects create when class does not exist", async () => {
    const db = createMockDb({
      class: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    });
    const service = createBatchService(db);

    await expect(
      service.createBatch({
        name: "Morning Batch",
        classId,
      }),
    ).rejects.toMatchObject(new ApiError(404, "Class not found"));
  });

  it("rejects create when teacher does not exist", async () => {
    const db = createMockDb({
      teacher: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    });
    const service = createBatchService(db);

    await expect(
      service.createBatch({
        name: "Morning Batch",
        classId,
        teacherId,
      }),
    ).rejects.toMatchObject(new ApiError(404, "Teacher not found"));
  });

  it("rejects deleting a batch with dependent records", async () => {
    const db = createMockDb({
      batch: {
        findUnique: vi.fn().mockResolvedValue({
          id: batchId,
          name: "Morning Batch",
          classId,
          _count: {
            ...emptyCount,
            students: 1,
          },
        }),
      },
    });
    const service = createBatchService(db);

    await expect(service.deleteBatch(batchId)).rejects.toMatchObject(
      new ApiError(409, "Batch has related records and cannot be deleted"),
    );
  });

  it("calculates pagination in list calls", async () => {
    const db = createMockDb({
      batch: {
        count: vi.fn().mockResolvedValue(35),
        findMany: vi.fn().mockResolvedValue([]),
      },
    });
    const service = createBatchService(db);

    const result = await service.listBatches({
      page: 3,
      pageSize: 10,
      search: "morning",
    });

    expect(result.pagination).toEqual({
      page: 3,
      pageSize: 10,
      total: 35,
      totalPages: 4,
    });
    expect(db.batch.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });
});
