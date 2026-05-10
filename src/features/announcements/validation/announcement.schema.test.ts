import { describe, expect, it } from "vitest";
import { createAnnouncementSchema, listAnnouncementsQuerySchema, updateAnnouncementSchema } from "./announcement.schema";

const batchId = "11111111-1111-4111-8111-111111111111";

describe("announcement validation", () => {
  it("accepts a valid announcement payload", () => {
    const result = createAnnouncementSchema.safeParse({
      title: "Holiday notice",
      message: "Classes are closed tomorrow.",
      batchId,
    });

    expect(result.success).toBe(true);
  });

  it("rejects short titles", () => {
    const result = createAnnouncementSchema.safeParse({
      title: "A",
      message: "Classes are closed tomorrow.",
      batchId,
    });

    expect(result.success).toBe(false);
  });

  it("rejects short messages", () => {
    const result = createAnnouncementSchema.safeParse({
      title: "Holiday notice",
      message: "A",
      batchId,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid batch ids", () => {
    const result = createAnnouncementSchema.safeParse({
      title: "Holiday notice",
      message: "Classes are closed tomorrow.",
      batchId: "not-a-uuid",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty updates", () => {
    expect(updateAnnouncementSchema.safeParse({}).success).toBe(false);
  });

  it("caps list page size", () => {
    const result = listAnnouncementsQuerySchema.safeParse({
      page: "1",
      pageSize: "101",
    });

    expect(result.success).toBe(false);
  });
});
