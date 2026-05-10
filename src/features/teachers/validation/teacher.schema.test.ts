import { describe, expect, it } from "vitest";
import { createTeacherSchema, listTeachersQuerySchema, updateTeacherSchema } from "./teacher.schema";

const userId = "11111111-1111-4111-8111-111111111111";

describe("teacher validation", () => {
  it("accepts a minimal valid teacher payload", () => {
    const result = createTeacherSchema.parse({
      userId,
    });

    expect(result).toEqual({
      userId,
    });
  });

  it("normalizes empty specialization", () => {
    const result = createTeacherSchema.parse({
      userId,
      specialization: "   ",
    });

    expect(result.specialization).toBeUndefined();
  });

  it("rejects invalid user ids", () => {
    const result = createTeacherSchema.safeParse({
      userId: "not-a-uuid",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty update payloads", () => {
    const result = updateTeacherSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("rejects update payloads that normalize to empty values", () => {
    const result = updateTeacherSchema.safeParse({
      specialization: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("caps page size", () => {
    const result = listTeachersQuerySchema.safeParse({
      page: "1",
      pageSize: "101",
    });

    expect(result.success).toBe(false);
  });
});
