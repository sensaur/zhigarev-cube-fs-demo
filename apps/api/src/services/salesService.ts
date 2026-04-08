import { randomUUID } from "node:crypto";
import type { Country, SaleRecord } from "@repo/shared";
import { countries } from "../data/countries.js";
import { categories } from "../data/categories.js";
import { paymentTypes } from "../data/paymentTypes.js";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  const ts = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(ts);
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]!;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateCustomerPool(
  selectedCountries: Country[],
  customersPerCountry: number,
): Map<string, string[]> {
  const pool = new Map<string, string[]>();
  for (const country of selectedCountries) {
    const ids: string[] = [];
    for (let i = 0; i < customersPerCountry; i++) {
      ids.push(randomUUID());
    }
    pool.set(country.code, ids);
  }
  return pool;
}

export const MAX_COUNTRIES = countries.length;
export const MAX_RECORDS = 10_000;

export function generateSales(
  countryCount: number,
  recordCount: number,
): SaleRecord[] {
  const clampedCountries = Math.max(1, Math.min(countryCount, MAX_COUNTRIES));
  const clampedRecords = Math.max(1, Math.min(recordCount, MAX_RECORDS));

  const selectedCountries = shuffle(countries).slice(0, clampedCountries);

  const customersPerCountry = Math.max(
    10,
    Math.ceil(clampedRecords / clampedCountries / 3),
  );
  const customerPool = generateCustomerPool(selectedCountries, customersPerCountry);

  const startDate = new Date(2026, 0, 1);
  const endDate = new Date();

  const records: SaleRecord[] = [];

  for (let i = 0; i < clampedRecords; i++) {
    const country = pick(selectedCountries);
    const countryCustomers = customerPool.get(country.code)!;

    records.push({
      id: randomUUID(),
      customerId: pick(countryCustomers),
      country,
      revenue: randomInt(1, 199),
      paymentType: pick(paymentTypes),
      saleDate: formatDate(randomDate(startDate, endDate)),
      category: pick(categories),
    });
  }

  return records;
}
