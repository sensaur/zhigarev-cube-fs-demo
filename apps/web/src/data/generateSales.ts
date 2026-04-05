import countries from "./countries.json";
import categories from "./categories.json";
import paymentTypes from "./paymentTypes.json";
import type { Country, Category, PaymentType, SaleRecord } from "./types";

const allCountries: Country[] = countries;
const allCategories: Category[] = categories;
const allPaymentTypes: PaymentType[] = paymentTypes;

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
  copy.forEach((_, i) => {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  });
  return copy;
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function generateSales(
  countryCount: number,
  recordCount: number,
): SaleRecord[] {
  const clamped = Math.min(countryCount, allCountries.length);
  const shuffled = shuffle(allCountries);
  const selectedCountries = shuffled.slice(0, clamped);

  const startDate = new Date(2026, 0, 1);
  const endDate = new Date();

  const records: SaleRecord[] = [];

  for (let i = 0; i < recordCount; i++) {
    records.push({
      id: crypto.randomUUID(),
      country: pick(selectedCountries),
      revenue: randomInt(1, 199),
      paymentType: pick(allPaymentTypes),
      saleDate: formatDate(randomDate(startDate, endDate)),
      category: pick(allCategories),
    });
  }

  return records;
}
