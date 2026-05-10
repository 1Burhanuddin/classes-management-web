import { z } from "zod";
import { emptyStringToUndefined, nonEmptyPatchSchema, optionalTrimmedString } from "@/lib/validation";

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format")
  .refine(
    (value) => {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));

      return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
    },
    { error: "Invalid calendar date" },
  )
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

const optionalFileUrl = z.preprocess(emptyStringToUndefined, z.string().trim().url().max(2048).optional());

export const assignmentIdSchema = z.object({
  id: z.uuid(),
});

export const listAssignmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: optionalTrimmedString(100),
  batchId: z.uuid().optional(),
});

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: optionalTrimmedString(2000),
  fileUrl: optionalFileUrl,
  dueDate: dateOnly.optional(),
  batchId: z.uuid(),
});

export const updateAssignmentSchema = nonEmptyPatchSchema(
  z.object({
    title: z.string().trim().min(2).max(120).optional(),
    description: optionalTrimmedString(2000),
    fileUrl: optionalFileUrl,
    dueDate: dateOnly.optional(),
    batchId: z.uuid().optional(),
  }),
);

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type CreateAssignmentBody = z.input<typeof createAssignmentSchema>;
export type ListAssignmentsQueryInput = z.input<typeof listAssignmentsQuerySchema>;
export type ListAssignmentsQuery = z.infer<typeof listAssignmentsQuerySchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type UpdateAssignmentBody = z.input<typeof updateAssignmentSchema>;
