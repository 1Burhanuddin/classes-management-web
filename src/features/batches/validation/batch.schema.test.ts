import { describe, expect, it } from "vitest";
import { createBatchSchema, listBatchesQuerySchema, updateBatchSchema } from "./batch.schema";

const classId = "11111111-1111-4111-8111-111111111111";
const teacherId = "22222222-2222-4222-8222-222222222222";

describe("batch validation", () => {
  it("accepts a minimal valid batch payload", () => {
    const result = createBatchSchema.parse({
      name: "Morning Batch",
      classId,
    });

    expect(result).toEqual({
      name: "Morning Batch",
      classId,
    });
  });

  it("accepts teacher and HH:mm time fields", () => {
    const result = createBatchSchema.parse({
      name: "Morning Batch",
      classId,
      teacherId,
      startTime: "09:00",
      endTime: "10:30",
    });

    expect(result.teacherId).toBe(teacherId);
    expect(result.startTime).toBe("09:00");
  });

  it("rejects invalid time strings", () => {
    const result = createBatchSchema.safeParse({
      name: "Morning Batch",
      classId,
      startTime: "9am",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty update payloads", () => {
    const result = updateBatchSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("caps page size", () => {
    const result = listBatchesQuerySchema.safeParse({
      page: "1",
      pageSize: "250",
    });

    expect(result.success).toBe(false);
  });
});
