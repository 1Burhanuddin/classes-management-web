import { describe, expect, it } from "vitest";
import { createAttendanceSchema, listAttendanceQuerySchema, updateAttendanceSchema } from "./attendance.schema";

const studentId = "11111111-1111-4111-8111-111111111111";
const batchId = "22222222-2222-4222-8222-222222222222";

describe("attendance validation", () => {
  it("accepts and normalizes a valid attendance payload", () => {
    const result = createAttendanceSchema.parse({
      studentId,
      batchId,
      status: "PRESENT",
      date: "2026-05-10",
      remarks: "  On time  ",
    });

    expect(result.date).toEqual(new Date("2026-05-10T00:00:00.000Z"));
    expect(result.remarks).toBe("On time");
  });

  it("rejects invalid date format", () => {
    const result = createAttendanceSchema.safeParse({
      studentId,
      batchId,
      status: "PRESENT",
      date: "10-05-2026",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = createAttendanceSchema.safeParse({
      studentId,
      batchId,
      status: "HOLIDAY",
      date: "2026-05-10",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty update payloads", () => {
    const result = updateAttendanceSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("rejects update payloads that normalize to empty values", () => {
    const result = updateAttendanceSchema.safeParse({
      remarks: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("caps page size", () => {
    const result = listAttendanceQuerySchema.safeParse({
      page: "1",
      pageSize: "101",
    });

    expect(result.success).toBe(false);
  });
});
