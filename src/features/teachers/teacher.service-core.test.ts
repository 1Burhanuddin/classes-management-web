import { describe, expect, it, vi } from "vitest";
import { Role } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api-errors";
import { createTeacherService, type TeacherServiceDb } from "./teacher.service-core";

const teacherId = "11111111-1111-4111-8111-111111111111";
const userId = "22222222-2222-4222-8222-222222222222";
const nextUserId = "33333333-3333-4333-8333-333333333333";

function createTeacher(overrides = {}) {
  return {
    id: teacherId,
    userId,
    specialization: "Math",
    user: {
      id: userId,
      email: "teacher@example.com",
      role: Role.TEACHER,
    },
    _count: {
      batches: 0,
    },
    ...overrides,
  };
}

function createUser(overrides = {}) {
  return {
    id: userId,
    role: Role.STUDENT,
    teacher: null,
    student: null,
    ...overrides,
  };
}

function createMockDb(overrides: Record<string, unknown> = {}) {
  const teacher = {
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(({ data }) => Promise.resolve(createTeacher(data))),
    delete: vi.fn().mockResolvedValue({ id: teacherId }),
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(createTeacher()),
    update: vi.fn().mockImplementation(({ data }) => Promise.resolve(createTeacher(data))),
  };
  const user = {
    findUnique: vi.fn().mockResolvedValue(createUser()),
    update: vi.fn().mockResolvedValue(createUser({ role: Role.TEACHER })),
  };
  const db = {
    teacher,
    user,
    $transaction: vi.fn(),
    ...overrides,
  };
  db.$transaction = vi.fn().mockImplementation((callback) => callback({ teacher: db.teacher, user: db.user }));

  return db as unknown as TeacherServiceDb;
}

describe("teacher service", () => {
  it("creates a teacher and promotes the linked user", async () => {
    const db = createMockDb();
    const service = createTeacherService(db);

    const teacher = await service.createTeacher({
      userId,
      specialization: "Math",
    });

    expect(teacher).toMatchObject({
      id: teacherId,
      userId,
      specialization: "Math",
    });
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { role: Role.TEACHER },
    });
  });

  it("rejects create when user does not exist", async () => {
    const db = createMockDb({
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    });
    const service = createTeacherService(db);

    await expect(service.createTeacher({ userId })).rejects.toMatchObject(new ApiError(404, "User not found"));
  });

  it("rejects linking admin users", async () => {
    const db = createMockDb({
      user: {
        findUnique: vi.fn().mockResolvedValue(createUser({ role: Role.ADMIN })),
      },
    });
    const service = createTeacherService(db);

    await expect(service.createTeacher({ userId })).rejects.toMatchObject(
      new ApiError(409, "Admin users cannot be linked to teacher profiles"),
    );
  });

  it("rejects users already linked to a student", async () => {
    const db = createMockDb({
      user: {
        findUnique: vi.fn().mockResolvedValue(createUser({ student: { id: "44444444-4444-4444-8444-444444444444" } })),
      },
    });
    const service = createTeacherService(db);

    await expect(service.createTeacher({ userId })).rejects.toMatchObject(new ApiError(409, "User is already linked to a student"));
  });

  it("rejects users already linked to another teacher", async () => {
    const db = createMockDb({
      user: {
        findUnique: vi.fn().mockResolvedValue(createUser({ teacher: { id: "44444444-4444-4444-8444-444444444444" } })),
      },
    });
    const service = createTeacherService(db);

    await expect(service.createTeacher({ userId })).rejects.toMatchObject(
      new ApiError(409, "User is already linked to another teacher"),
    );
  });

  it("moves a teacher profile to a new user and resets the old teacher user role", async () => {
    const db = createMockDb({
      user: {
        findUnique: vi.fn().mockResolvedValue(createUser({ id: nextUserId })),
        update: vi.fn().mockResolvedValue(createUser({ role: Role.TEACHER })),
      },
    });
    const service = createTeacherService(db);

    await service.updateTeacher(teacherId, {
      userId: nextUserId,
    });

    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: nextUserId },
      data: { role: Role.TEACHER },
    });
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { role: Role.STUDENT },
    });
  });

  it("rejects deleting a teacher with batches", async () => {
    const db = createMockDb({
      teacher: {
        findUnique: vi.fn().mockResolvedValue(createTeacher({ _count: { batches: 1 } })),
      },
    });
    const service = createTeacherService(db);

    await expect(service.deleteTeacher(teacherId)).rejects.toMatchObject(
      new ApiError(409, "Teacher has batches and cannot be deleted"),
    );
  });

  it("calculates pagination in list calls", async () => {
    const db = createMockDb({
      teacher: {
        count: vi.fn().mockResolvedValue(21),
        findMany: vi.fn().mockResolvedValue([]),
      },
    });
    const service = createTeacherService(db);

    const result = await service.listTeachers({
      page: 2,
      pageSize: 10,
      search: "math",
    });

    expect(result.pagination).toEqual({
      page: 2,
      pageSize: 10,
      total: 21,
      totalPages: 3,
    });
    expect(db.teacher.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });
});
