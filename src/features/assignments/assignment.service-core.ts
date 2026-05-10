import { Role, type Prisma, type PrismaClient } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api-errors";
import type { AssignmentActor } from "./types/assignment.types";
import type { CreateAssignmentInput, ListAssignmentsQuery, UpdateAssignmentInput } from "./validation/assignment.schema";

export type AssignmentServiceDb = Pick<PrismaClient, "assignment" | "batch" | "student" | "teacher">;

const assignmentInclude = {
  batch: {
    select: {
      id: true,
      name: true,
      teacherId: true,
      class: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.AssignmentInclude;

export function createAssignmentService(db: AssignmentServiceDb) {
  async function getTeacherForActor(actor: AssignmentActor) {
    const teacher = await db.teacher.findUnique({
      where: { userId: actor.id },
      select: {
        id: true,
        batches: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new ApiError(403, "Teacher profile not found");
    }

    return teacher;
  }

  async function getStudentForActor(actor: AssignmentActor) {
    const student = await db.student.findUnique({
      where: { userId: actor.id },
      select: {
        id: true,
        batchId: true,
      },
    });

    if (!student) {
      throw new ApiError(403, "Student profile not found");
    }

    return student;
  }

  async function assertBatchExists(batchId: string) {
    const batch = await db.batch.findUnique({
      where: { id: batchId },
      select: {
        id: true,
        teacherId: true,
      },
    });

    if (!batch) {
      throw new ApiError(404, "Batch not found");
    }

    return batch;
  }

  async function assertCanManageBatch(actor: AssignmentActor, batchId: string) {
    if (actor.role === Role.ADMIN) {
      return;
    }

    if (actor.role !== Role.TEACHER) {
      throw new ApiError(403, "Forbidden");
    }

    const teacher = await getTeacherForActor(actor);
    const canManageBatch = teacher.batches.some((batch) => batch.id === batchId);

    if (!canManageBatch) {
      throw new ApiError(403, "Teacher cannot manage this batch");
    }
  }

  async function getAssignment(id: string) {
    const assignment = await db.assignment.findUnique({
      where: { id },
      include: assignmentInclude,
    });

    if (!assignment) {
      throw new ApiError(404, "Assignment not found");
    }

    return assignment;
  }

  async function assertCanReadAssignment(actor: AssignmentActor, assignment: Awaited<ReturnType<typeof getAssignment>>) {
    if (actor.role === Role.ADMIN) {
      return;
    }

    if (actor.role === Role.TEACHER) {
      await assertCanManageBatch(actor, assignment.batchId);
      return;
    }

    const student = await getStudentForActor(actor);

    if (student.batchId !== assignment.batchId) {
      throw new ApiError(403, "Forbidden");
    }
  }

  return {
    async listAssignments(actor: AssignmentActor, query: ListAssignmentsQuery) {
      const where: Prisma.AssignmentWhereInput = {
        batchId: query.batchId,
        ...(query.search
          ? {
              OR: [
                { title: { contains: query.search, mode: "insensitive" } },
                { description: { contains: query.search, mode: "insensitive" } },
              ],
            }
          : {}),
      };

      if (actor.role === Role.TEACHER) {
        const teacher = await getTeacherForActor(actor);
        const assignedBatchIds = teacher.batches.map((batch) => batch.id);

        if (query.batchId && !assignedBatchIds.includes(query.batchId)) {
          throw new ApiError(403, "Teacher cannot access this batch");
        }

        if (assignedBatchIds.length === 0) {
          return {
            assignments: [],
            pagination: {
              page: query.page,
              pageSize: query.pageSize,
              total: 0,
              totalPages: 0,
            },
          };
        }

        where.batchId = query.batchId ?? { in: assignedBatchIds };
      } else if (actor.role === Role.STUDENT) {
        const student = await getStudentForActor(actor);

        if (query.batchId && query.batchId !== student.batchId) {
          throw new ApiError(403, "Forbidden");
        }

        where.batchId = student.batchId;
      }

      const skip = (query.page - 1) * query.pageSize;
      const [assignments, total] = await Promise.all([
        db.assignment.findMany({
          where,
          include: assignmentInclude,
          orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
          skip,
          take: query.pageSize,
        }),
        db.assignment.count({ where }),
      ]);

      return {
        assignments,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      };
    },

    async getAssignment(actor: AssignmentActor, id: string) {
      const assignment = await getAssignment(id);
      await assertCanReadAssignment(actor, assignment);

      return assignment;
    },

    async createAssignment(actor: AssignmentActor, input: CreateAssignmentInput) {
      await assertBatchExists(input.batchId);
      await assertCanManageBatch(actor, input.batchId);

      return db.assignment.create({
        data: {
          ...input,
          createdBy: actor.id,
        },
        include: assignmentInclude,
      });
    },

    async updateAssignment(actor: AssignmentActor, id: string, input: UpdateAssignmentInput) {
      const assignment = await getAssignment(id);
      await assertCanManageBatch(actor, assignment.batchId);

      if (input.batchId && input.batchId !== assignment.batchId) {
        await assertBatchExists(input.batchId);
        await assertCanManageBatch(actor, input.batchId);
      }

      return db.assignment.update({
        where: { id },
        data: input,
        include: assignmentInclude,
      });
    },

    async deleteAssignment(actor: AssignmentActor, id: string) {
      const assignment = await getAssignment(id);
      await assertCanManageBatch(actor, assignment.batchId);

      await db.assignment.delete({
        where: { id },
      });

      return { id };
    },
  };
}
