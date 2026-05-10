import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(1).max(500).optional(),
);

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
  description: optionalText,
});

export const updateClassSchema = createClassSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required",
});

export type CreateClassInput = z.infer<typeof createClassSchema>;
export type ListClassesQuery = z.infer<typeof listClassesQuerySchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
