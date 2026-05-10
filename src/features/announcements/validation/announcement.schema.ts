import { z } from "zod";
import { nonEmptyPatchSchema, optionalTrimmedString } from "@/lib/validation";

export const announcementIdSchema = z.object({
  id: z.uuid(),
});

export const listAnnouncementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: optionalTrimmedString(100),
  batchId: z.uuid().optional(),
});

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(2).max(120),
  message: z.string().trim().min(2).max(5000),
  batchId: z.uuid(),
});

export const updateAnnouncementSchema = nonEmptyPatchSchema(
  z.object({
    title: z.string().trim().min(2).max(120).optional(),
    message: z.string().trim().min(2).max(5000).optional(),
    batchId: z.uuid().optional(),
  }),
);

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type CreateAnnouncementBody = z.input<typeof createAnnouncementSchema>;
export type ListAnnouncementsQueryInput = z.input<typeof listAnnouncementsQuerySchema>;
export type ListAnnouncementsQuery = z.infer<typeof listAnnouncementsQuerySchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type UpdateAnnouncementBody = z.input<typeof updateAnnouncementSchema>;
