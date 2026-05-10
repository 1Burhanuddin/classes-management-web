import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api-errors";
import type { CreateBatchInput, ListBatchesQuery, UpdateBatchInput } from "./validation/batch.schema";

export type BatchServiceDb = Pick<PrismaClient, "batch" | "class" | "teacher">;

const batchInclude = {
  class: {
    select: {
      id: true,
      name: true,
    },
  },
  teacher: {
    select: {
      id: true,
      specialization: true,
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  },
  _count: {
    select: {
      students: true,
      assignments: true,
      announcements: true,
      attendances: true,
    },
  },
} satisfies Prisma.BatchInclude;

export function createBatchService(db: BatchServiceDb) {
  async function assertClassExists(classId: string) {
    const classRecord = await db.class.findUnique({
      where: { id: classId },
      select: { id: true },
    });

    if (!classRecord) {
      throw new ApiError(404, "Class not found");
    }
  }

  async function assertTeacherExists(teacherId: string) {
    const teacher = await db.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true },
    });

    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
  }

  async function getBatch(id: string) {
    const batch = await db.batch.findUnique({
      where: { id },
      include: batchInclude,
    });

    if (!batch) {
      throw new ApiError(404, "Batch not found");
    }

    return batch;
  }

  return {
    async listBatches(query: ListBatchesQuery) {
      const where: Prisma.BatchWhereInput = {
        classId: query.classId,
        teacherId: query.teacherId,
        ...(query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: "insensitive" } },
                { class: { name: { contains: query.search, mode: "insensitive" } } },
                { teacher: { user: { email: { contains: query.search, mode: "insensitive" } } } },
              ],
            }
          : {}),
      };

      const skip = (query.page - 1) * query.pageSize;
      const [batches, total] = await Promise.all([
        db.batch.findMany({
          where,
          include: batchInclude,
          orderBy: { createdAt: "desc" },
          skip,
          take: query.pageSize,
        }),
        db.batch.count({ where }),
      ]);

      return {
        batches,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      };
    },

    getBatch,

    async createBatch(input: CreateBatchInput) {
      await assertClassExists(input.classId);

      if (input.teacherId) {
        await assertTeacherExists(input.teacherId);
      }

      return db.batch.create({
        data: input,
        include: batchInclude,
      });
    },

    async updateBatch(id: string, input: UpdateBatchInput) {
      await getBatch(id);

      if (input.classId) {
        await assertClassExists(input.classId);
      }

      if (input.teacherId) {
        await assertTeacherExists(input.teacherId);
      }

      return db.batch.update({
        where: { id },
        data: input,
        include: batchInclude,
      });
    },

    async deleteBatch(id: string) {
      const batch = await getBatch(id);
      const hasDependentRecords =
        batch._count.students > 0 ||
        batch._count.assignments > 0 ||
        batch._count.announcements > 0 ||
        batch._count.attendances > 0;

      if (hasDependentRecords) {
        throw new ApiError(409, "Batch has related records and cannot be deleted");
      }

      await db.batch.delete({
        where: { id },
      });

      return { id };
    },
  };
}
