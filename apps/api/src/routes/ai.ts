import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import type { AiQueryResponse, AiChatHistoryResponse, AiChatMessage } from "@repo/shared";

const router = Router();

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const HISTORY_LIMIT = 10;

const SYSTEM_PROMPT = `You are an analytics assistant. You receive HTTP request log data from a web application and answer user questions about it.

Each log entry has these fields:
- method: HTTP method (GET, POST, etc.)
- path: request path (e.g. /api/sales, /health)
- statusCode: HTTP status code (200, 404, 500, etc.)
- responseTimeMs: response time in milliseconds
- ip: client IP address (can be used to infer geographic origin)
- userAgent: browser/client user-agent string
- createdAt: ISO 8601 timestamp

Analyze the data and answer the user's question. You MUST respond with ONLY valid JSON — no markdown, no code fences, no explanation outside the JSON.

Response format:
{ "answer": "your textual answer here", "data": [optional array of objects if a table would help illustrate the answer] }

If a table is not useful for the answer, omit the "data" field entirely.
Keep answers concise and data-driven.`;

const sessionIdSchema = z.string().uuid();

const querySchema = z.object({
  sessionId: z.string().uuid(),
  question: z.string().min(1).max(500),
});

router.get("/api/ai/history", async (req, res) => {
  const parsed = sessionIdSchema.safeParse(req.query.sessionId);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid sessionId" });
    return;
  }

  const messages = await prisma.aiChat.findMany({
    where: { sessionId: parsed.data },
    orderBy: { createdAt: "asc" },
  });

  const response: AiChatHistoryResponse = {
    messages: messages.map((m) => ({
      ...m,
      role: m.role as "user" | "assistant",
      data: m.data as AiChatMessage["data"],
      createdAt: m.createdAt.toISOString(),
    })),
  };
  res.json(response);
});

router.delete("/api/ai/history", async (req, res) => {
  const parsed = sessionIdSchema.safeParse(req.query.sessionId);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid sessionId" });
    return;
  }

  await prisma.aiChat.deleteMany({ where: { sessionId: parsed.data } });
  res.json({ ok: true });
});

router.post("/api/ai/query", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "AI service is not configured" });
    return;
  }

  const parsed = querySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid request",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { sessionId, question } = parsed.data;

  try {
    const [logs, history] = await Promise.all([
      prisma.requestLog.findMany({
        select: {
          method: true,
          path: true,
          statusCode: true,
          responseTimeMs: true,
          ip: true,
          userAgent: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.aiChat.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        take: HISTORY_LIMIT,
      }),
    ]);

    await prisma.aiChat.create({
      data: { sessionId, role: "user", content: question },
    });

    const historyMessages = history
      .reverse()
      .map((msg) => ({ role: msg.role as "user" | "assistant", content: msg.content }));

    const userMessage = `Here are the latest ${logs.length} HTTP request logs:\n\n${JSON.stringify(logs)}\n\nQuestion: ${question}`;

    const anthropicRes = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [...historyMessages, { role: "user", content: userMessage }],
      }),
    });

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      logger.error({ status: anthropicRes.status, body: errBody }, "Anthropic API error");
      res.status(502).json({ error: "AI service returned an error" });
      return;
    }

    const anthropicData = (await anthropicRes.json()) as {
      content: Array<{ type: string; text: string }>;
    };

    const rawText = anthropicData.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    let result: AiQueryResponse;
    try {
      result = JSON.parse(rawText) as AiQueryResponse;
    } catch {
      result = { answer: rawText };
    }

    await prisma.aiChat.create({
      data: {
        sessionId,
        role: "assistant",
        content: result.answer,
        data: result.data ? JSON.parse(JSON.stringify(result.data)) : undefined,
      },
    });

    res.json(result);
  } catch (err) {
    logger.error(err, "AI query failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
