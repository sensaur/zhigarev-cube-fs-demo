import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";

const router = Router();

const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  method: z.string().toUpperCase().optional(),
  path: z.string().optional(),
  statusCode: z.coerce.number().int().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

router.get("/api/requests", async (req, res) => {
  const parsed = listSchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid query parameters",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { page, limit, method, path, statusCode, from, to } = parsed.data;

  const where: Prisma.RequestLogWhereInput = {
    ...(method && { method }),
    ...(path && { path: { contains: path } }),
    ...(statusCode && { statusCode }),
    ...((from ?? to) && {
      createdAt: {
        ...(from && { gte: from }),
        ...(to && { lte: to }),
      },
    }),
  };

  const [logs, total] = await Promise.all([
    prisma.requestLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.requestLog.count({ where }),
  ]);

  res.json({
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

router.get("/api/requests/stats", async (req, res) => {
  const periodSchema = z.object({
    hours: z.coerce.number().int().min(1).max(720).default(24),
  });

  const parsed = periodSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid query parameters",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const since = new Date(Date.now() - parsed.data.hours * 3600_000);

  const [overview, topEndpoints, statusBreakdown, hourlyTraffic] =
    await Promise.all([
      prisma.requestLog.aggregate({
        where: { createdAt: { gte: since } },
        _count: true,
        _avg: { responseTimeMs: true },
        _max: { responseTimeMs: true },
        _min: { responseTimeMs: true },
      }),

      prisma.requestLog.groupBy({
        by: ["method", "path"],
        where: { createdAt: { gte: since } },
        _count: true,
        _avg: { responseTimeMs: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),

      prisma.requestLog.groupBy({
        by: ["statusCode"],
        where: { createdAt: { gte: since } },
        _count: true,
        orderBy: { statusCode: "asc" },
      }),

      prisma.$queryRaw<
        Array<{ hour: Date; count: bigint; avg_ms: number }>
      >`
        SELECT
          date_trunc('hour', "createdAt") AS hour,
          COUNT(*)                        AS count,
          AVG("responseTimeMs")::int      AS avg_ms
        FROM "RequestLog"
        WHERE "createdAt" >= ${since}
        GROUP BY hour
        ORDER BY hour
      `,
    ]);

  res.json({
    period: { since: since.toISOString(), hours: parsed.data.hours },
    overview: {
      totalRequests: overview._count,
      avgResponseMs: Math.round(overview._avg.responseTimeMs ?? 0),
      maxResponseMs: overview._max.responseTimeMs ?? 0,
      minResponseMs: overview._min.responseTimeMs ?? 0,
    },
    topEndpoints: topEndpoints.map((e) => ({
      method: e.method,
      path: e.path,
      count: e._count,
      avgResponseMs: Math.round(e._avg.responseTimeMs ?? 0),
    })),
    statusBreakdown: statusBreakdown.map((s) => ({
      statusCode: s.statusCode,
      count: s._count,
    })),
    hourlyTraffic: hourlyTraffic.map((h) => ({
      hour: h.hour,
      count: Number(h.count),
      avgResponseMs: h.avg_ms,
    })),
  });
});

export default router;
