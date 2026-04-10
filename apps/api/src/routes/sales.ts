import { Router } from "express";
import { z } from "zod";
import type { GenerateSalesResponse } from "@repo/shared";
import { MAX_COUNTRIES, MAX_RECORDS } from "../services/salesService.js";
import { sessionManager } from "../services/sessionManager.js";
import { countries } from "../data/countries.js";
import { categories } from "../data/categories.js";
import { paymentTypes } from "../data/paymentTypes.js";

const router = Router();

const generateSalesSchema = z.object({
  sessionId: z.string().uuid(),
  countryCount: z.coerce.number().int().min(1).max(MAX_COUNTRIES).default(5),
  recordCount: z.coerce.number().int().min(1).max(MAX_RECORDS).default(50),
});

router.get("/api/sales", (req, res) => {
  const parsed = generateSalesSchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid query parameters",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { sessionId, countryCount, recordCount } = parsed.data;
  const session = sessionManager.getOrCreate(sessionId, countryCount, recordCount);
  const records = sessionManager.getAllRecords(session);

  const response: GenerateSalesResponse = {
    records,
    meta: {
      countryCount: session.countries.length,
      recordCount: records.length,
      liveCount: session.liveSales.length,
      generatedAt: new Date().toISOString(),
      sessionId,
    },
    countries: session.countries,
  };

  res.json(response);
});

router.get("/api/sales/countries", (_req, res) => {
  res.json(countries);
});

router.get("/api/sales/categories", (_req, res) => {
  res.json(categories);
});

router.get("/api/sales/payment-types", (_req, res) => {
  res.json(paymentTypes);
});

export default router;
