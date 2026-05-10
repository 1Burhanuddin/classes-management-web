import { z } from "zod";
import { FeeStatus } from "@/generated/prisma/client";
import { nonEmptyPatchSchema } from "@/lib/validation";

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

export const feeIdSchema = z.object({
  id: z.uuid(),
});

export const listFeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  studentId: z.uuid().optional(),
  status: z.enum(FeeStatus).optional(),
});

export const createFeeSchema = z.object({
  studentId: z.uuid(),
  amount: z.coerce.number().positive().max(1_000_000),
  dueDate: dateOnly,
  status: z.enum(FeeStatus).default(FeeStatus.PENDING),
  paidAt: dateOnly.optional(),
});

export const updateFeeSchema = nonEmptyPatchSchema(
  z.object({
    studentId: z.uuid().optional(),
    amount: z.coerce.number().positive().max(1_000_000).optional(),
    dueDate: dateOnly.optional(),
    status: z.enum(FeeStatus).optional(),
    paidAt: dateOnly.optional(),
  }),
);

export type CreateFeeInput = z.infer<typeof createFeeSchema>;
export type CreateFeeBody = z.input<typeof createFeeSchema>;
export type ListFeesQueryInput = z.input<typeof listFeesQuerySchema>;
export type ListFeesQuery = z.infer<typeof listFeesQuerySchema>;
export type UpdateFeeInput = z.infer<typeof updateFeeSchema>;
export type UpdateFeeBody = z.input<typeof updateFeeSchema>;
