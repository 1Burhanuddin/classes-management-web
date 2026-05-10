import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api-errors";
import type { CreateStudentInput, ListStudentsQuery, UpdateStudentInput } from "./validation/student.schema";

export type StudentServiceDb = Pick<PrismaClient, "student" | "batch" | "user">;

const studentInclude = {
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
  user: {
    select: {
      id: true,
      email: true,
    },
  },
} satisfies Prisma.StudentInclude;

export function createStudentService(db: StudentServiceDb) {
  async function assertBatchExists(batchId: string) {
    const batch = await db.batch.findUnique({
      where: { id: batchId },
      select: { id: true },
    });

    if (!batch) {
      throw new ApiError(404, "Batch not found");
    }
  }

  async function assertUserCanBeLinked(userId: string, currentStudentId?: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        student: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.student && user.student.id !== currentStudentId) {
      throw new ApiError(409, "User is already linked to another student");
    }
  }

  async function getStudent(id: string) {
    const student = await db.student.findUnique({
      where: { id },
      include: studentInclude,
    });

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    return student;
  }

  return {
    async listStudents(query: ListStudentsQuery) {
      const where: Prisma.StudentWhereInput = {
        batchId: query.batchId,
        ...(query.search
          ? {
              OR: [
                { fullName: { contains: query.search, mode: "insensitive" } },
                { phone: { contains: query.search, mode: "insensitive" } },
                { parentPhone: { contains: query.search, mode: "insensitive" } },
                { user: { email: { contains: query.search, mode: "insensitive" } } },
              ],
            }
          : {}),
      };

      const skip = (query.page - 1) * query.pageSize;
      const [students, total] = await Promise.all([
        db.student.findMany({
          where,
          include: studentInclude,
          orderBy: { createdAt: "desc" },
          skip,
          take: query.pageSize,
        }),
        db.student.count({ where }),
      ]);

      return {
        students,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      };
    },

    getStudent,

    async createStudent(input: CreateStudentInput) {
      await assertBatchExists(input.batchId);

      if (input.userId) {
        await assertUserCanBeLinked(input.userId);
      }

      return db.student.create({
        data: input,
        include: studentInclude,
      });
    },

    async updateStudent(id: string, input: UpdateStudentInput) {
      await getStudent(id);

      if (input.batchId) {
        await assertBatchExists(input.batchId);
      }

      if (input.userId) {
        await assertUserCanBeLinked(input.userId, id);
      }

      return db.student.update({
        where: { id },
        data: input,
        include: studentInclude,
      });
    },

    async deleteStudent(id: string) {
      await getStudent(id);

      await db.student.delete({
        where: { id },
      });

      return { id };
    },
  };
}
