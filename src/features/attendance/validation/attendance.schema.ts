import { z } from "zod";
import { nonEmptyPatchSchema, optionalTrimmedString } from "@/lib/validation";

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

export const attendanceIdSchema = z.object({
  id: z.uuid(),
});

export const listAttendanceQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  batchId: z.uuid().optional(),
  studentId: z.uuid().optional(),
  date: dateOnly.optional(),
});

export const createAttendanceSchema = z.object({
  studentId: z.uuid(),
  batchId: z.uuid(),
  status: z.enum(["PRESENT", "ABSENT", "LATE"]),
  remarks: optionalTrimmedString(500),
  date: dateOnly,
});

export const updateAttendanceSchema = nonEmptyPatchSchema(
  z.object({
    status: z.enum(["PRESENT", "ABSENT", "LATE"]).optional(),
    remarks: optionalTrimmedString(500),
    date: dateOnly.optional(),
  }),
);

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>;
export type ListAttendanceQueryInput = z.input<typeof listAttendanceQuerySchema>;
export type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
