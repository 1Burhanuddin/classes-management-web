import { Role, type Prisma, type PrismaClient } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api-errors";
import type { FeeActor } from "./types/fee.types";
import type { CreateFeeInput, ListFeesQuery, UpdateFeeInput } from "./validation/fee.schema";

export type FeeServiceDb = Pick<PrismaClient, "fee" | "student">;

const feeInclude = {
  student: {
    select: {
      id: true,
      fullName: true,
      batch: {
        select: {
          id: true,
          name: true,
          class: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.FeeInclude;

export function createFeeService(db: FeeServiceDb) {
  async function getStudentForActor(actor: FeeActor) {
    const student = await db.student.findUnique({
      where: { userId: actor.id },
      select: {
        id: true,
      },
    });

    if (!student) {
      throw new ApiError(403, "Student profile not found");
    }

    return student;
  }

  async function assertStudentExists(studentId: string) {
    const student = await db.student.findUnique({
      where: { id: studentId },
      select: { id: true },
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }
  }

  async function assertAdmin(actor: FeeActor) {
    if (actor.role !== Role.ADMIN) {
      throw new ApiError(403, "Forbidden");
    }
  }

  async function getFee(id: string) {
    const fee = await db.fee.findUnique({
      where: { id },
      include: feeInclude,
    });

    if (!fee) {
      throw new ApiError(404, "Fee not found");
    }

    return fee;
  }

  async function assertCanReadFee(actor: FeeActor, fee: Awaited<ReturnType<typeof getFee>>) {
    if (actor.role === Role.ADMIN) {
      return;
    }

    if (actor.role !== Role.STUDENT) {
      throw new ApiError(403, "Forbidden");
    }

    const student = await getStudentForActor(actor);

    if (student.id !== fee.studentId) {
      throw new ApiError(403, "Forbidden");
    }
  }

  return {
    async listFees(actor: FeeActor, query: ListFeesQuery) {
      const where: Prisma.FeeWhereInput = {
        studentId: query.studentId,
        status: query.status,
      };

      if (actor.role === Role.STUDENT) {
        const student = await getStudentForActor(actor);

        if (query.studentId && query.studentId !== student.id) {
          throw new ApiError(403, "Forbidden");
        }

        where.studentId = student.id;
      } else if (actor.role !== Role.ADMIN) {
        throw new ApiError(403, "Forbidden");
      }

      const skip = (query.page - 1) * query.pageSize;
      const [fees, total] = await Promise.all([
        db.fee.findMany({
          where,
          include: feeInclude,
          orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
          skip,
          take: query.pageSize,
        }),
        db.fee.count({ where }),
      ]);

      return {
        fees,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      };
    },

    async getFee(actor: FeeActor, id: string) {
      const fee = await getFee(id);
      await assertCanReadFee(actor, fee);

      return fee;
    },

    async createFee(actor: FeeActor, input: CreateFeeInput) {
      await assertAdmin(actor);
      await assertStudentExists(input.studentId);

      return db.fee.create({
        data: input,
        include: feeInclude,
      });
    },

    async updateFee(actor: FeeActor, id: string, input: UpdateFeeInput) {
      await assertAdmin(actor);
      await getFee(id);

      if (input.studentId) {
        await assertStudentExists(input.studentId);
      }

      return db.fee.update({
        where: { id },
        data: input,
        include: feeInclude,
      });
    },

    async deleteFee(actor: FeeActor, id: string) {
      await assertAdmin(actor);
      await getFee(id);

      await db.fee.delete({
        where: { id },
      });

      return { id };
    },
  };
}
