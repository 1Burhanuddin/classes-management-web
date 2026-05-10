import { describe, expect, it } from "vitest";
import { createClassSchema, listClassesQuerySchema, updateClassSchema } from "./class.schema";

describe("class validation", () => {
  it("accepts a minimal valid class payload", () => {
    const result = createClassSchema.parse({
      name: "Grade 10",
    });

    expect(result).toEqual({
      name: "Grade 10",
    });
  });

  it("trims and accepts an optional description", () => {
    const result = createClassSchema.parse({
      name: "Grade 10",
      description: "  Science stream  ",
    });

    expect(result.description).toBe("Science stream");
  });

  it("rejects short names", () => {
    const result = createClassSchema.safeParse({
      name: "A",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty update payloads", () => {
    const result = updateClassSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("caps page size", () => {
    const result = listClassesQuerySchema.safeParse({
      page: "1",
      pageSize: "101",
    });

    expect(result.success).toBe(false);
  });
});
