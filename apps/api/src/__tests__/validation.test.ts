import { describe, it, expect } from "vitest";
import { aiQueryBodySchema } from "../schemas/aiQueryBody.js";

describe("aiQueryBodySchema", () => {
  it("accepts valid input", () => {
    const result = aiQueryBodySchema.safeParse({
      conversationId: "abc123",
      question: "What is the most popular endpoint?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing conversationId", () => {
    const result = aiQueryBodySchema.safeParse({
      question: "What is the most popular endpoint?",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty question", () => {
    const result = aiQueryBodySchema.safeParse({
      conversationId: "abc123",
      question: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects question exceeding 500 characters", () => {
    const result = aiQueryBodySchema.safeParse({
      conversationId: "abc123",
      question: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts question at exactly 500 characters", () => {
    const result = aiQueryBodySchema.safeParse({
      conversationId: "abc123",
      question: "a".repeat(500),
    });
    expect(result.success).toBe(true);
  });
});
