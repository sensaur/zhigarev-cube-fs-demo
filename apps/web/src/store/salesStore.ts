import { create } from "zustand";
import type { SaleRecord, Country } from "@repo/shared";
import { apiFetch } from "@/lib/api";
import type { GenerateSalesResponse } from "@repo/shared";
import { getSessionId } from "@/lib/session";

const DEFAULT_COUNTRIES = 5;
const DEFAULT_RECORDS = 50;
export const MAX_COUNTRIES = 27;
export const MAX_RECORDS = 10_000;

const DEBOUNCE_MS = 300;

interface SalesState {
  countryCount: number;
  recordCount: number;
  records: SaleRecord[];
  countries: Country[];
  liveCount: number;
  loading: boolean;
  error: string | null;
  setCountryCount: (n: number) => void;
  setRecordCount: (n: number) => void;
  refresh: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

let regenerateTimer: ReturnType<typeof setTimeout> | null = null;
let abortController: AbortController | null = null;

async function fetchSales(store: typeof useSalesStore) {
  abortController?.abort();
  abortController = new AbortController();

  const { countryCount, recordCount } = store.getState();
  store.setState({ loading: true, error: null });

  try {
    const params = new URLSearchParams({
      sessionId: getSessionId(),
      countryCount: String(countryCount),
      recordCount: String(recordCount),
    });

    const data = await apiFetch<GenerateSalesResponse>(
      `/api/sales?${params}`,
      { signal: abortController.signal },
    );

    store.setState({
      records: data.records,
      countries: data.countries,
      liveCount: data.meta.liveCount,
      loading: false,
    });

    window.dispatchEvent(new CustomEvent("sales:session-updated"));
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    const message = err instanceof Error ? err.message : "Failed to fetch sales data";
    store.setState({ error: message, loading: false });
  }
}

function debouncedFetch(store: typeof useSalesStore) {
  if (regenerateTimer) clearTimeout(regenerateTimer);
  regenerateTimer = setTimeout(() => void fetchSales(store), DEBOUNCE_MS);
}

export const useSalesStore = create<SalesState>((set) => ({
  countryCount: DEFAULT_COUNTRIES,
  recordCount: DEFAULT_RECORDS,
  records: [],
  countries: [],
  liveCount: 0,
  loading: true,
  error: null,

  setCountryCount: (n) => {
    const countryCount = clamp(n, 1, MAX_COUNTRIES);
    if (countryCount === useSalesStore.getState().countryCount) return;
    set({ countryCount });
    debouncedFetch(useSalesStore);
  },

  setRecordCount: (n) => {
    const recordCount = clamp(n, 1, MAX_RECORDS);
    if (recordCount === useSalesStore.getState().recordCount) return;
    set({ recordCount });
    debouncedFetch(useSalesStore);
  },

  refresh: () => {
    void fetchSales(useSalesStore);
  },
}));

void fetchSales(useSalesStore);
