import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

const IGNORED_PREFIXES = ["/health", "/ready"];

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();

  if (IGNORED_PREFIXES.some((p) => req.path.startsWith(p))) {
    next();
    return;
  }

  res.on("finish", () => {
    const responseTimeMs = Date.now() - start;

    const queryString = Object.keys(req.query).length > 0
      ? JSON.stringify(req.query)
      : null;

    prisma.requestLog
      .create({
        data: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          responseTimeMs,
          ip: req.ip ?? req.socket.remoteAddress ?? null,
          userAgent: req.get("user-agent") ?? null,
          queryParams: queryString,
          contentLength: Number(res.get("content-length")) || null,
        },
      })
      .catch((err) => {
        logger.error({ err }, "Failed to persist request log");
      });
  });

  next();
};
