import { z } from "zod";
import { nonEmptyPatchSchema, optionalTrimmedString } from "@/lib/validation";

export const teacherIdSchema = z.object({
  id: z.uuid(),
});

export const listTeachersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
});

export const createTeacherSchema = z.object({
  userId: z.uuid(),
  specialization: optionalTrimmedString(120),
});

export const updateTeacherSchema = nonEmptyPatchSchema(createTeacherSchema);

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type ListTeachersQuery = z.infer<typeof listTeachersQuerySchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
