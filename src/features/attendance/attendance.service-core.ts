import { Role, type Prisma, type PrismaClient } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api-errors";
import type { AttendanceActor } from "./types/attendance.types";
import type { CreateAttendanceInput, ListAttendanceQuery, UpdateAttendanceInput } from "./validation/attendance.schema";

export type AttendanceServiceDb = Pick<PrismaClient, "attendance" | "batch" | "student" | "teacher">;

const attendanceInclude = {
  student: {
    select: {
      id: true,
      fullName: true,
    },
  },
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
} satisfies Prisma.AttendanceInclude;

export function createAttendanceService(db: AttendanceServiceDb) {
  async function getTeacherForActor(actor: AttendanceActor) {
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

  async function getStudentForActor(actor: AttendanceActor) {
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

  async function assertBatchAndStudent(input: { batchId: string; studentId: string }) {
    const [batch, student] = await Promise.all([
      db.batch.findUnique({
        where: { id: input.batchId },
        select: {
          id: true,
          teacherId: true,
        },
      }),
      db.student.findUnique({
        where: { id: input.studentId },
        select: {
          id: true,
          batchId: true,
        },
      }),
    ]);

    if (!batch) {
      throw new ApiError(404, "Batch not found");
    }

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    if (student.batchId !== batch.id) {
      throw new ApiError(400, "Student does not belong to batch");
    }

    return { batch, student };
  }

  async function assertCanManageBatch(actor: AttendanceActor, batchId: string) {
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

  async function getAttendance(id: string) {
    const attendance = await db.attendance.findUnique({
      where: { id },
      include: attendanceInclude,
    });

    if (!attendance) {
      throw new ApiError(404, "Attendance not found");
    }

    return attendance;
  }

  async function assertCanReadAttendance(actor: AttendanceActor, attendance: Awaited<ReturnType<typeof getAttendance>>) {
    if (actor.role === Role.ADMIN) {
      return;
    }

    if (actor.role === Role.TEACHER) {
      await assertCanManageBatch(actor, attendance.batchId);
      return;
    }

    const student = await getStudentForActor(actor);

    if (student.id !== attendance.studentId) {
      throw new ApiError(403, "Forbidden");
    }
  }

  return {
    async listAttendance(actor: AttendanceActor, query: ListAttendanceQuery) {
      const where: Prisma.AttendanceWhereInput = {
        batchId: query.batchId,
        studentId: query.studentId,
        date: query.date,
      };

      if (actor.role === Role.TEACHER) {
        const teacher = await getTeacherForActor(actor);
        const assignedBatchIds = teacher.batches.map((batch) => batch.id);

        if (query.batchId && !assignedBatchIds.includes(query.batchId)) {
          throw new ApiError(403, "Teacher cannot access this batch");
        }

        if (assignedBatchIds.length === 0) {
          return {
            attendance: [],
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

        if (query.studentId && query.studentId !== student.id) {
          throw new ApiError(403, "Forbidden");
        }

        if (query.batchId && query.batchId !== student.batchId) {
          throw new ApiError(403, "Forbidden");
        }

        where.studentId = student.id;
        where.batchId = query.batchId ?? student.batchId;
      }

      const skip = (query.page - 1) * query.pageSize;
      const [attendance, total] = await Promise.all([
        db.attendance.findMany({
          where,
          include: attendanceInclude,
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
          skip,
          take: query.pageSize,
        }),
        db.attendance.count({ where }),
      ]);

      return {
        attendance,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      };
    },

    async getAttendance(actor: AttendanceActor, id: string) {
      const attendance = await getAttendance(id);
      await assertCanReadAttendance(actor, attendance);

      return attendance;
    },

    async createAttendance(actor: AttendanceActor, input: CreateAttendanceInput) {
      await assertCanManageBatch(actor, input.batchId);
      await assertBatchAndStudent(input);

      const existing = await db.attendance.findUnique({
        where: {
          studentId_batchId_date: {
            studentId: input.studentId,
            batchId: input.batchId,
            date: input.date,
          },
        },
        select: { id: true },
      });

      if (existing) {
        throw new ApiError(409, "Attendance already exists for this student, batch, and date");
      }

      return db.attendance.create({
        data: input,
        include: attendanceInclude,
      });
    },

    async updateAttendance(actor: AttendanceActor, id: string, input: UpdateAttendanceInput) {
      const attendance = await getAttendance(id);
      await assertCanManageBatch(actor, attendance.batchId);

      if (input.date && input.date.getTime() !== attendance.date.getTime()) {
        const existing = await db.attendance.findUnique({
          where: {
            studentId_batchId_date: {
              studentId: attendance.studentId,
              batchId: attendance.batchId,
              date: input.date,
            },
          },
          select: { id: true },
        });

        if (existing) {
          throw new ApiError(409, "Attendance already exists for this student, batch, and date");
        }
      }

      return db.attendance.update({
        where: { id },
        data: input,
        include: attendanceInclude,
      });
    },

    async deleteAttendance(actor: AttendanceActor, id: string) {
      const attendance = await getAttendance(id);
      await assertCanManageBatch(actor, attendance.batchId);

      await db.attendance.delete({
        where: { id },
      });

      return { id };
    },
  };
}
