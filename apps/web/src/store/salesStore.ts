import { create } from "zustand";
import { generateSales } from "@/data/generateSales";
import type { SaleRecord } from "@/data/types";

const DEFAULT_COUNTRIES = 5;
const DEFAULT_RECORDS = 50;
export const MAX_COUNTRIES = 27;
export const MAX_RECORDS = 10_000;

const DEBOUNCE_MS = 300;

interface SalesState {
  countryCount: number;
  recordCount: number;
  records: SaleRecord[];
  setCountryCount: (n: number) => void;
  setRecordCount: (n: number) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

let regenerateTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedRegenerate(store: typeof useSalesStore) {
  if (regenerateTimer) clearTimeout(regenerateTimer);
  regenerateTimer = setTimeout(() => {
    const { countryCount, recordCount } = store.getState();
    store.setState({ records: generateSales(countryCount, recordCount) });
  }, DEBOUNCE_MS);
}

export const useSalesStore = create<SalesState>((set) => ({
  countryCount: DEFAULT_COUNTRIES,
  recordCount: DEFAULT_RECORDS,
  records: generateSales(DEFAULT_COUNTRIES, DEFAULT_RECORDS),

  setCountryCount: (n) => {
    const countryCount = clamp(n, 1, MAX_COUNTRIES);
    if (countryCount === useSalesStore.getState().countryCount) return;
    set({ countryCount });
    debouncedRegenerate(useSalesStore);
  },

  setRecordCount: (n) => {
    const recordCount = clamp(n, 1, MAX_RECORDS);
    if (recordCount === useSalesStore.getState().recordCount) return;
    set({ recordCount });
    debouncedRegenerate(useSalesStore);
  },
}));
