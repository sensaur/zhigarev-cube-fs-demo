import type { Country, SaleRecord, LiveSale } from "@repo/shared";
import { generateOneLiveSale } from "./salesService.js";

const MIN_INTERVAL_MS = 1_000;
const MAX_INTERVAL_MS = 10_000;

function randomInterval(): number {
  return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
}

export function toLiveSale(record: SaleRecord): LiveSale {
  return {
    id: record.id,
    countryCode: record.country.code,
    countryName: record.country.name,
    revenue: record.revenue,
    category: record.category.name,
    paymentType: record.paymentType.name,
    timestamp: new Date().toISOString(),
  };
}

export function startLiveFeed(
  countries: Country[],
  onSale: (record: SaleRecord, liveSale: LiveSale) => void,
): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  function scheduleNext() {
    if (stopped) return;
    timer = setTimeout(() => {
      if (stopped) return;
      const record = generateOneLiveSale(countries);
      const liveSale = toLiveSale(record);
      onSale(record, liveSale);
      scheduleNext();
    }, randomInterval());
  }

  scheduleNext();

  return () => {
    stopped = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
}
