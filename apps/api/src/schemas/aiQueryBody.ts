import { z } from "zod";

/** POST /api/ai/query JSON body */
export const aiQueryBodySchema = z.object({
  conversationId: z.string().min(1),
  question: z.string().min(1).max(500),
});
