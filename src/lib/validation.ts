import { z } from "zod";

export const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const optionalTrimmedString = (maxLength: number) =>
  z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(maxLength).optional());

export const nonEmptyPatchSchema = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
  schema.partial().refine((value) => Object.keys(value).length > 0, {
    error: "At least one field is required",
  });
