import { describe, it, expect } from "vitest";
import {
  generateSales,
  pickCountries,
  MAX_COUNTRIES,
  MAX_RECORDS,
  generateOneLiveSale,
} from "../services/salesService.js";

describe("salesService", () => {
  describe("pickCountries", () => {
    it("returns the requested number of countries", () => {
      const countries = pickCountries(3);
      expect(countries).toHaveLength(3);
      countries.forEach((c) => {
        expect(c).toHaveProperty("code");
        expect(c).toHaveProperty("name");
      });
    });

    it("caps count at MAX_COUNTRIES when requesting more than available", () => {
      const countries = pickCountries(999);
      expect(countries).toHaveLength(MAX_COUNTRIES);
    });
  });

  describe("generateSales", () => {
    it("returns the exact number of requested records", () => {
      const records = generateSales(3, 50);
      expect(records).toHaveLength(50);
    });

    it("produces records with valid fields", () => {
      const records = generateSales(2, 10);
      records.forEach((r) => {
        expect(r.id).toBeTruthy();
        expect(r.revenue).toBeGreaterThan(0);
        expect(r.country.code).toBeTruthy();
        expect(r.paymentType).toBeTruthy();
        expect(r.category).toBeTruthy();
        expect(r.saleDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it("clamps record count to MAX_RECORDS", () => {
      const records = generateSales(1, MAX_RECORDS + 5000);
      expect(records).toHaveLength(MAX_RECORDS);
    });
  });

  describe("generateOneLiveSale", () => {
    it("generates a single sale for the given countries", () => {
      const countries = pickCountries(2);
      const sale = generateOneLiveSale(countries);
      expect(sale.id).toBeTruthy();
      expect(countries.map((c) => c.code)).toContain(sale.country.code);
    });
  });
});
