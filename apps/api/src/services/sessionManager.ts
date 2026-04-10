import type { Country, SaleRecord, CountryMonthlyStat, LiveSalesSnapshot } from "@repo/shared";
import { pickCountries, generateSalesForCountries } from "./salesService.js";

interface Accumulator {
  monthRevenue: number;
  monthOrders: number;
  todayRevenue: number;
  todayOrders: number;
}

export interface Session {
  id: string;
  countries: Country[];
  countryCount: number;
  recordCount: number;
  baseSales: SaleRecord[];
  liveSales: SaleRecord[];
  accumulators: Map<string, Accumulator>;
  currentMonth: string;
  currentDay: string;
  version: number;
}

function fmtMonth(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fmtDay(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

class SessionManager {
  private sessions = new Map<string, Session>();

  getOrCreate(sessionId: string, countryCount: number, recordCount: number): Session {
    const existing = this.sessions.get(sessionId);

    if (
      existing &&
      existing.countryCount === countryCount &&
      existing.recordCount === recordCount
    ) {
      return existing;
    }

    const countries = pickCountries(countryCount);
    const baseSales = generateSalesForCountries(countries, recordCount);
    const now = new Date();

    const session: Session = {
      id: sessionId,
      countries,
      countryCount,
      recordCount,
      baseSales,
      liveSales: [],
      accumulators: new Map(),
      currentMonth: fmtMonth(now),
      currentDay: fmtDay(now),
      version: (existing?.version ?? 0) + 1,
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  get(sessionId: string): Session | null {
    return this.sessions.get(sessionId) ?? null;
  }

  addLiveSale(session: Session, record: SaleRecord): void {
    session.liveSales.push(record);

    const now = new Date();
    const month = fmtMonth(now);
    const day = fmtDay(now);

    if (month !== session.currentMonth) {
      session.accumulators.clear();
      session.currentMonth = month;
      session.currentDay = day;
    } else if (day !== session.currentDay) {
      for (const acc of session.accumulators.values()) {
        acc.todayRevenue = 0;
        acc.todayOrders = 0;
      }
      session.currentDay = day;
    }

    const code = record.country.code;
    const acc = session.accumulators.get(code) ?? {
      monthRevenue: 0,
      monthOrders: 0,
      todayRevenue: 0,
      todayOrders: 0,
    };
    acc.monthRevenue += record.revenue;
    acc.monthOrders += 1;
    acc.todayRevenue += record.revenue;
    acc.todayOrders += 1;
    session.accumulators.set(code, acc);
  }

  getLiveSnapshot(session: Session): LiveSalesSnapshot {
    const stats: CountryMonthlyStat[] = [];

    for (const country of session.countries) {
      const acc = session.accumulators.get(country.code);
      if (acc) {
        stats.push({
          countryCode: country.code,
          countryName: country.name,
          monthRevenue: Math.round(acc.monthRevenue * 100) / 100,
          monthOrders: acc.monthOrders,
          todayRevenue: Math.round(acc.todayRevenue * 100) / 100,
          todayOrders: acc.todayOrders,
        });
      }
    }

    return { stats, month: session.currentMonth };
  }

  getAllRecords(session: Session): SaleRecord[] {
    return [...session.baseSales, ...session.liveSales];
  }

  destroy(): void {
    this.sessions.clear();
  }
}

export const sessionManager = new SessionManager();
