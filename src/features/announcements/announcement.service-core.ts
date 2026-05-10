import { Role, type Prisma, type PrismaClient } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api-errors";
import type { AnnouncementActor } from "./types/announcement.types";
import type {
  CreateAnnouncementInput,
  ListAnnouncementsQuery,
  UpdateAnnouncementInput,
} from "./validation/announcement.schema";

export type AnnouncementServiceDb = Pick<PrismaClient, "announcement" | "batch" | "student" | "teacher">;

const announcementInclude = {
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
} satisfies Prisma.AnnouncementInclude;

export function createAnnouncementService(db: AnnouncementServiceDb) {
  async function getTeacherForActor(actor: AnnouncementActor) {
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

  async function getStudentForActor(actor: AnnouncementActor) {
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

  async function assertCanManageBatch(actor: AnnouncementActor, batchId: string) {
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

  async function getAnnouncement(id: string) {
    const announcement = await db.announcement.findUnique({
      where: { id },
      include: announcementInclude,
    });

    if (!announcement) {
      throw new ApiError(404, "Announcement not found");
    }

    return announcement;
  }

  async function assertCanReadAnnouncement(actor: AnnouncementActor, announcement: Awaited<ReturnType<typeof getAnnouncement>>) {
    if (actor.role === Role.ADMIN) {
      return;
    }

    if (actor.role === Role.TEACHER) {
      await assertCanManageBatch(actor, announcement.batchId);
      return;
    }

    const student = await getStudentForActor(actor);

    if (student.batchId !== announcement.batchId) {
      throw new ApiError(403, "Forbidden");
    }
  }

  return {
    async listAnnouncements(actor: AnnouncementActor, query: ListAnnouncementsQuery) {
      const where: Prisma.AnnouncementWhereInput = {
        batchId: query.batchId,
        ...(query.search
          ? {
              OR: [
                { title: { contains: query.search, mode: "insensitive" } },
                { message: { contains: query.search, mode: "insensitive" } },
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
            announcements: [],
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
      const [announcements, total] = await Promise.all([
        db.announcement.findMany({
          where,
          include: announcementInclude,
          orderBy: { createdAt: "desc" },
          skip,
          take: query.pageSize,
        }),
        db.announcement.count({ where }),
      ]);

      return {
        announcements,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      };
    },

    async getAnnouncement(actor: AnnouncementActor, id: string) {
      const announcement = await getAnnouncement(id);
      await assertCanReadAnnouncement(actor, announcement);

      return announcement;
    },

    async createAnnouncement(actor: AnnouncementActor, input: CreateAnnouncementInput) {
      await assertBatchExists(input.batchId);
      await assertCanManageBatch(actor, input.batchId);

      return db.announcement.create({
        data: {
          ...input,
          createdBy: actor.id,
        },
        include: announcementInclude,
      });
    },

    async updateAnnouncement(actor: AnnouncementActor, id: string, input: UpdateAnnouncementInput) {
      const announcement = await getAnnouncement(id);
      await assertCanManageBatch(actor, announcement.batchId);

      if (input.batchId && input.batchId !== announcement.batchId) {
        await assertBatchExists(input.batchId);
        await assertCanManageBatch(actor, input.batchId);
      }

      return db.announcement.update({
        where: { id },
        data: input,
        include: announcementInclude,
      });
    },

    async deleteAnnouncement(actor: AnnouncementActor, id: string) {
      const announcement = await getAnnouncement(id);
      await assertCanManageBatch(actor, announcement.batchId);

      await db.announcement.delete({
        where: { id },
      });

      return { id };
    },
  };
}
