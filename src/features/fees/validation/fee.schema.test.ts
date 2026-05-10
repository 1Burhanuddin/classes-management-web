import { describe, expect, it } from "vitest";
import { FeeStatus } from "@/generated/prisma/client";
import { createFeeSchema, listFeesQuerySchema, updateFeeSchema } from "./fee.schema";

const studentId = "11111111-1111-4111-8111-111111111111";

describe("fee validation", () => {
  it("accepts a valid fee payload", () => {
    const result = createFeeSchema.safeParse({
      studentId,
      amount: 1500,
      dueDate: "2026-05-20",
      status: FeeStatus.PENDING,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid amounts", () => {
    const result = createFeeSchema.safeParse({
      studentId,
      amount: 0,
      dueDate: "2026-05-20",
    });

    expect(result.success).toBe(false);
  });

  it("rejects impossible due dates", () => {
    const result = createFeeSchema.safeParse({
      studentId,
      amount: 1500,
      dueDate: "2026-02-31",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid statuses", () => {
    const result = createFeeSchema.safeParse({
      studentId,
      amount: 1500,
      dueDate: "2026-05-20",
      status: "WAIVED",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty updates", () => {
    expect(updateFeeSchema.safeParse({}).success).toBe(false);
  });

  it("caps list page size", () => {
    const result = listFeesQuerySchema.safeParse({
      page: "1",
      pageSize: "101",
    });

    expect(result.success).toBe(false);
  });
});
