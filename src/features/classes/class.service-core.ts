import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api-errors";
import type { CreateClassInput, ListClassesQuery, UpdateClassInput } from "./validation/class.schema";

export type ClassServiceDb = Pick<PrismaClient, "class">;

const classInclude = {
  _count: {
    select: {
      batches: true,
    },
  },
} satisfies Prisma.ClassInclude;

export function createClassService(db: ClassServiceDb) {
  async function getClass(id: string) {
    const classRecord = await db.class.findUnique({
      where: { id },
      include: classInclude,
    });

    if (!classRecord) {
      throw new ApiError(404, "Class not found");
    }

    return classRecord;
  }

  return {
    async listClasses(query: ListClassesQuery) {
      const where: Prisma.ClassWhereInput = query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {};

      const skip = (query.page - 1) * query.pageSize;
      const [classes, total] = await Promise.all([
        db.class.findMany({
          where,
          include: classInclude,
          orderBy: { createdAt: "desc" },
          skip,
          take: query.pageSize,
        }),
        db.class.count({ where }),
      ]);

      return {
        classes,
        pagination: {
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages: Math.ceil(total / query.pageSize),
        },
      };
    },

    getClass,

    async createClass(input: CreateClassInput) {
      return db.class.create({
        data: input,
        include: classInclude,
      });
    },

    async updateClass(id: string, input: UpdateClassInput) {
      await getClass(id);

      return db.class.update({
        where: { id },
        data: input,
        include: classInclude,
      });
    },

    async deleteClass(id: string) {
      const classRecord = await getClass(id);

      if (classRecord._count.batches > 0) {
        throw new ApiError(409, "Class has batches and cannot be deleted");
      }

      await db.class.delete({
        where: { id },
      });

      return { id };
    },
  };
}
