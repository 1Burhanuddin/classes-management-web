import { Role, type Prisma, type PrismaClient, type Teacher, type User } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api-errors";
import type { CreateTeacherInput, ListTeachersQuery, UpdateTeacherInput } from "./validation/teacher.schema";

export type TeacherServiceDb = Pick<PrismaClient, "teacher" | "user" | "$transaction">;

const teacherInclude = {
  user: {
    select: {
      id: true,
      email: true,
      role: true,
    },
  },
  _count: {
    select: {
      batches: true,
    },
  },
} satisfies Prisma.TeacherInclude;

type LinkableUser = Pick<User, "id" | "role"> & {
  teacher: Pick<Teacher, "id"> | null;
  student: {
    id: string;
  } | null;
};

export function createTeacherService(db: TeacherServiceDb) {
  async function getTeacher(id: string) {
    const teacher = await db.teacher.findUnique({
      where: { id },
      include: teacherInclude,
    });

    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }

    return teacher;
  }

  function assertUserCanBeLinked(user: LinkableUser | null, currentTeacherId?: string) {
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role === Role.ADMIN) {
      throw new ApiError(409, "Admin users cannot be linked to teacher profiles");
    }

    if (user.student) {
      throw new ApiError(409, "User is already linked to a student");
    }

    if (user.teacher && user.teacher.id !== currentTeacherId) {
      throw new ApiError(409, "User is already linked to another teacher");
    }
  }

  async function getLinkableUser(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        teacher: {
          select: {
            id: true,
          },
        },
        student: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  return {
    async listTeachers(query: ListTeachersQuery) {
      const where: Prisma.TeacherWhereInput = query.search
        ? {
            OR: [
              { specialization: { contains: query.search, mode: "insensitive" } },
              { user: { email: { contains: query.search, mode: "insensitive" } } },
            ],
          }
        : {};

      const skip = (query.page - 1) * query.pageSize;
      const [teachers, total] = await Promise.all([
        db.teacher.findMany({
          where,
          include: teacherInclude,
          orderBy: { createdAt: "desc" },
          skip,
          take: query.pageSize,
        }),
        db.teacher.count({ where }),
      ]);

      return {
        teachers,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      };
    },

    getTeacher,

    async createTeacher(input: CreateTeacherInput) {
      const user = await getLinkableUser(input.userId);
      assertUserCanBeLinked(user);

      return db.$transaction(async (tx) => {
        const teacher = await tx.teacher.create({
          data: input,
          include: teacherInclude,
        });

        await tx.user.update({
          where: { id: input.userId },
          data: { role: Role.TEACHER },
        });

        return teacher;
      });
    },

    async updateTeacher(id: string, input: UpdateTeacherInput) {
      const currentTeacher = await getTeacher(id);

      if (input.userId) {
        const nextUser = await getLinkableUser(input.userId);
        assertUserCanBeLinked(nextUser, id);
      }

      return db.$transaction(async (tx) => {
        const teacher = await tx.teacher.update({
          where: { id },
          data: input,
          include: teacherInclude,
        });

        if (input.userId && input.userId !== currentTeacher.userId) {
          await tx.user.update({
            where: { id: input.userId },
            data: { role: Role.TEACHER },
          });

          if (currentTeacher.user.role === Role.TEACHER) {
            await tx.user.update({
              where: { id: currentTeacher.userId },
              data: { role: Role.STUDENT },
            });
          }
        }

        return teacher;
      });
    },

    async deleteTeacher(id: string) {
      const teacher = await getTeacher(id);

      if (teacher._count.batches > 0) {
        throw new ApiError(409, "Teacher has batches and cannot be deleted");
      }

      await db.$transaction(async (tx) => {
        await tx.teacher.delete({
          where: { id },
        });

        if (teacher.user.role === Role.TEACHER) {
          await tx.user.update({
            where: { id: teacher.userId },
            data: { role: Role.STUDENT },
          });
        }
      });

      return { id };
    },
  };
}
