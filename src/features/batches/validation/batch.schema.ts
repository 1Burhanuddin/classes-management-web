import { z } from "zod";
import { emptyStringToUndefined, nonEmptyPatchSchema } from "@/lib/validation";

const optionalTime = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format")
    .optional(),
);

export const batchIdSchema = z.object({
  id: z.uuid(),
});

export const listBatchesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  classId: z.uuid().optional(),
  teacherId: z.uuid().optional(),
});

export const createBatchSchema = z.object({
  name: z.string().trim().min(2).max(120),
  classId: z.uuid(),
  teacherId: z.uuid().optional(),
  startTime: optionalTime,
  endTime: optionalTime,
});

export const updateBatchSchema = nonEmptyPatchSchema(createBatchSchema);

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type ListBatchesQuery = z.infer<typeof listBatchesQuerySchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
