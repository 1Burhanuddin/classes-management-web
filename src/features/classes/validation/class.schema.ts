import { z } from "zod";
import { nonEmptyPatchSchema, optionalTrimmedString } from "@/lib/validation";

export const classIdSchema = z.object({
  id: z.uuid(),
});

export const listClassesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
});

export const createClassSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: optionalTrimmedString(500),
});

export const updateClassSchema = nonEmptyPatchSchema(createClassSchema);

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type ListClassesQuery = z.infer<typeof listClassesQuerySchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
