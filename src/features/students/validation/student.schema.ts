import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).max(500).optional(),
);

const phone = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
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
  address: optionalText,
  batchId: z.uuid(),
  userId: z.uuid().optional(),
});

export const updateStudentSchema = createStudentSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required",
});

export type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>;
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
