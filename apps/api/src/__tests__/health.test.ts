import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("API endpoints", () => {
  describe("GET /health", () => {
    it("returns 200 with ok status", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true, service: "api" });
    });
  });

  describe("GET /api/sales/countries", () => {
    it("returns 200 with an array of countries", async () => {
      const res = await request(app).get("/api/sales/countries");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty("code");
      expect(res.body[0]).toHaveProperty("name");
    });
  });
});
