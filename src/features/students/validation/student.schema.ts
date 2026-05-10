import { z } from "zod";
import { emptyStringToUndefined, nonEmptyPatchSchema, optionalTrimmedString } from "@/lib/validation";

const phone = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Invalid phone number")
    .optional(),
);

export const studentIdSchema = z.object({
  id: z.uuid(),
});

export const listStudentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  batchId: z.uuid().optional(),
});

export const createStudentSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone,
  parentPhone: phone,
  address: optionalTrimmedString(500),
  batchId: z.uuid(),
  userId: z.uuid().optional(),
});

export const updateStudentSchema = nonEmptyPatchSchema(createStudentSchema);

export type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
