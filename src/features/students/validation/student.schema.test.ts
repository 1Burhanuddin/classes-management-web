import { describe, expect, it } from "vitest";
import { createStudentSchema, listStudentsQuerySchema, updateStudentSchema } from "./student.schema";

const batchId = "11111111-1111-4111-8111-111111111111";

describe("student validation", () => {
  it("accepts a minimal valid student payload", () => {
    const result = createStudentSchema.parse({
      fullName: "Amina Khan",
      batchId,
    });

    expect(result).toEqual({
      fullName: "Amina Khan",
      batchId,
    });
  });

  it("rejects invalid ids and short names", () => {
    const result = createStudentSchema.safeParse({
      fullName: "A",
      batchId: "not-a-uuid",
    });

    expect(result.success).toBe(false);
  });

  it("rejects suspicious phone values", () => {
    const result = createStudentSchema.safeParse({
      fullName: "Amina Khan",
      batchId,
      phone: "call-me<script>",
    });

    expect(result.success).toBe(false);
  });

  it("does not allow empty update payloads", () => {
    const result = updateStudentSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("does not allow update payloads that normalize to empty values", () => {
    const result = updateStudentSchema.safeParse({
      address: "   ",
      phone: "",
    });

    expect(result.success).toBe(false);
  });

  it("caps page size to protect list endpoints", () => {
    const result = listStudentsQuerySchema.safeParse({
      page: "1",
      pageSize: "1000",
    });

    expect(result.success).toBe(false);
  });
});
