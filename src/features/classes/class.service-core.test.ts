import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-errors";
import { createClassService, type ClassServiceDb } from "./class.service-core";

const classId = "11111111-1111-4111-8111-111111111111";

function createMockDb(overrides: Partial<ClassServiceDb> = {}) {
  const db = {
    class: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: classId, ...data, _count: { batches: 0 } })),
      delete: vi.fn().mockResolvedValue({ id: classId }),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue({ id: classId, name: "Grade 10", _count: { batches: 0 } }),
      update: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: classId, ...data, _count: { batches: 0 } })),
    },
    ...overrides,
  };

  return db as unknown as ClassServiceDb;
}

describe("class service", () => {
  it("creates a class", async () => {
    const db = createMockDb();
    const service = createClassService(db);

    const classRecord = await service.createClass({
      name: "Grade 10",
    });

    expect(classRecord).toMatchObject({
      id: classId,
      name: "Grade 10",
    });
  });

  it("rejects fetching a missing class", async () => {
    const db = createMockDb({
      class: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as Partial<ClassServiceDb>);
    const service = createClassService(db);

    await expect(service.getClass(classId)).rejects.toMatchObject(new ApiError(404, "Class not found"));
  });

  it("rejects deleting a class with batches", async () => {
    const db = createMockDb({
      class: {
        findUnique: vi.fn().mockResolvedValue({ id: classId, name: "Grade 10", _count: { batches: 1 } }),
      },
    } as Partial<ClassServiceDb>);
    const service = createClassService(db);

    await expect(service.deleteClass(classId)).rejects.toMatchObject(
      new ApiError(409, "Class has batches and cannot be deleted"),
    );
  });

  it("calculates pagination in list calls", async () => {
    const db = createMockDb({
      class: {
        count: vi.fn().mockResolvedValue(22),
        findMany: vi.fn().mockResolvedValue([]),
      },
    } as Partial<ClassServiceDb>);
    const service = createClassService(db);

    const result = await service.listClasses({
      page: 2,
      pageSize: 10,
      search: "grade",
    });

    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 22,
      totalPages: 3,
    });
    expect(db.class.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });
});
