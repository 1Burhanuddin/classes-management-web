import { describe, expect, it, vi } from "vitest";
import { FeeStatus, Role } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api-errors";
import { createFeeService, type FeeServiceDb } from "./fee.service-core";

const feeId = "11111111-1111-4111-8111-111111111111";
const studentId = "22222222-2222-4222-8222-222222222222";
const userId = "33333333-3333-4333-8333-333333333333";
const dueDate = new Date("2026-05-20T00:00:00.000Z");

const adminActor = { id: userId, role: Role.ADMIN };
const teacherActor = { id: userId, role: Role.TEACHER };
const studentActor = { id: userId, role: Role.STUDENT };

function createFee(overrides = {}) {
  return {
    id: feeId,
    studentId,
    amount: 1500,
    dueDate,
    status: FeeStatus.PENDING,
    paidAt: null,
    createdAt: new Date("2026-05-10T00:00:00.000Z"),
    updatedAt: new Date("2026-05-10T00:00:00.000Z"),
    student: {
      id: studentId,
      fullName: "Amina Khan",
      batch: {
        id: "44444444-4444-4444-8444-444444444444",
        name: "Morning Batch",
        class: {
          id: "55555555-5555-4555-8555-555555555555",
          name: "Grade 10",
        },
      },
    },
    ...overrides,
  };
}

function buildFeeMocks(overrides = {}) {
  return {
    count: vi.fn().mockResolvedValue(0),
    create: vi.fn().mockImplementation(({ data }) => Promise.resolve(createFee(data))),
    delete: vi.fn().mockResolvedValue({ id: feeId }),
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(createFee()),
    update: vi.fn().mockImplementation(({ data }) => Promise.resolve(createFee(data))),
    ...overrides,
  };
}

function buildStudentMocks(overrides = {}) {
  return {
    findUnique: vi.fn().mockResolvedValue({ id: studentId }),
    ...overrides,
  };
}

function createMockDb(overrides: Record<string, unknown> = {}) {
  const db = {
    fee: buildFeeMocks(),
    student: buildStudentMocks(),
    ...overrides,
  };

  return db as unknown as FeeServiceDb;
}

describe("fee service", () => {
  it("allows admin to create fees when student exists", async () => {
    const db = createMockDb();
    const service = createFeeService(db);

    const fee = await service.createFee(adminActor, {
      studentId,
      amount: 1500,
      dueDate,
      status: FeeStatus.PENDING,
    });

    expect(fee).toMatchObject({
      studentId,
      amount: 1500,
      status: FeeStatus.PENDING,
    });
    expect(db.student.findUnique).toHaveBeenCalledWith({
      where: { id: studentId },
      select: { id: true },
    });
  });

  it("rejects create when student does not exist", async () => {
    const db = createMockDb({
      student: buildStudentMocks({
        findUnique: vi.fn().mockResolvedValue(null),
      }),
    });
    const service = createFeeService(db);

    await expect(
      service.createFee(adminActor, {
        studentId,
        amount: 1500,
        dueDate,
        status: FeeStatus.PENDING,
      }),
    ).rejects.toMatchObject(new ApiError(404, "Student not found"));
  });

  it("rejects non-admin writes", async () => {
    const db = createMockDb();
    const service = createFeeService(db);

    await expect(
      service.createFee(teacherActor, {
        studentId,
        amount: 1500,
        dueDate,
        status: FeeStatus.PENDING,
      }),
    ).rejects.toMatchObject(new ApiError(403, "Forbidden"));
  });

  it("limits student list access to their own fees", async () => {
    const db = createMockDb({
      fee: buildFeeMocks({
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([createFee()]),
      }),
    });
    const service = createFeeService(db);

    const result = await service.listFees(studentActor, {
      page: 1,
      pageSize: 20,
    });

    expect(result.pagination.total).toBe(1);
    expect(db.student.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: studentActor.id },
      }),
    );
    expect(db.fee.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          studentId,
        }),
      }),
    );
  });

  it("rejects student reads for another student's fee", async () => {
    const db = createMockDb({
      fee: buildFeeMocks({
        findUnique: vi.fn().mockResolvedValue(createFee({ studentId: "66666666-6666-4666-8666-666666666666" })),
      }),
    });
    const service = createFeeService(db);

    await expect(service.getFee(studentActor, feeId)).rejects.toMatchObject(new ApiError(403, "Forbidden"));
  });
});
