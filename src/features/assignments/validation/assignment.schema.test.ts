import { describe, expect, it } from "vitest";
import { createAssignmentSchema, listAssignmentsQuerySchema, updateAssignmentSchema } from "./assignment.schema";

const batchId = "11111111-1111-4111-8111-111111111111";

describe("assignment validation", () => {
  it("accepts a valid assignment payload", () => {
    const result = createAssignmentSchema.safeParse({
      title: "Algebra worksheet",
      description: "Complete chapter 4 exercises.",
      fileUrl: "https://example.com/worksheet.pdf",
      dueDate: "2026-05-20",
      batchId,
    });

    expect(result.success).toBe(true);
  });

  it("rejects short titles", () => {
    const result = createAssignmentSchema.safeParse({
      title: "A",
      batchId,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid file urls", () => {
    const result = createAssignmentSchema.safeParse({
      title: "Algebra worksheet",
      fileUrl: "not-a-url",
      batchId,
    });

    expect(result.success).toBe(false);
  });

  it("rejects impossible due dates", () => {
    const result = createAssignmentSchema.safeParse({
      title: "Algebra worksheet",
      dueDate: "2026-02-31",
      batchId,
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty updates and normalized-empty updates", () => {
    expect(updateAssignmentSchema.safeParse({}).success).toBe(false);
    expect(updateAssignmentSchema.safeParse({ description: "", fileUrl: "" }).success).toBe(false);
  });

  it("caps list page size", () => {
    const result = listAssignmentsQuerySchema.safeParse({
      page: "1",
      pageSize: "101",
    });

    expect(result.success).toBe(false);
  });
});
