import { create } from "zustand";
import type { LiveSale, CountryMonthlyStat, LiveSalesSnapshot, WsServerEvent, Country } from "@repo/shared";
import { createSocket } from "@/lib/ws";
import { getSessionId } from "@/lib/session";

const MAX_RECENT = 30;
const MARKER_TTL_MS = 4_000;
const RECONNECT_DELAY_MS = 3_000;

export interface RecentSale extends LiveSale {
  expiresAt: number;
}

interface LiveMapState {
  connected: boolean;
  stats: CountryMonthlyStat[];
  recentSales: RecentSale[];
  totalLiveSales: number;
  month: string;
  lastSale: LiveSale | null;
  sessionCountries: Country[];
}

interface LiveMapActions {
  connect: () => () => void;
}

export const useLiveMapStore = create<LiveMapState & LiveMapActions>((set) => {
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let cleanupTimer: ReturnType<typeof setInterval> | null = null;

  function pruneExpired() {
    const now = Date.now();
    set((s) => ({
      recentSales: s.recentSales.filter((r) => r.expiresAt > now),
    }));
  }

  function handleSnapshot(snapshot: LiveSalesSnapshot) {
    const snapshotTotal = snapshot.stats.reduce((sum, s) => sum + s.monthOrders, 0);
    set({
      stats: snapshot.stats,
      month: snapshot.month,
      totalLiveSales: snapshotTotal,
      recentSales: [],
      lastSale: null,
    });
  }

  function handleLiveSale(sale: LiveSale) {
    const now = Date.now();
    const recent: RecentSale = { ...sale, expiresAt: now + MARKER_TTL_MS };

    set((s) => {
      const statsMap = new Map(s.stats.map((st) => [st.countryCode, { ...st }]));
      const existing = statsMap.get(sale.countryCode);

      if (existing) {
        existing.monthRevenue = Math.round((existing.monthRevenue + sale.revenue) * 100) / 100;
        existing.monthOrders += 1;
        existing.todayRevenue = Math.round((existing.todayRevenue + sale.revenue) * 100) / 100;
        existing.todayOrders += 1;
      } else {
        statsMap.set(sale.countryCode, {
          countryCode: sale.countryCode,
          countryName: sale.countryName,
          monthRevenue: sale.revenue,
          monthOrders: 1,
          todayRevenue: sale.revenue,
          todayOrders: 1,
        });
      }

      const recentSales = [...s.recentSales, recent]
        .filter((r) => r.expiresAt > now)
        .slice(-MAX_RECENT);

      return {
        stats: Array.from(statsMap.values()),
        recentSales,
        totalLiveSales: s.totalLiveSales + 1,
        lastSale: sale,
      };
    });
  }

  function handleMessage(data: unknown) {
    const event = data as WsServerEvent;
    switch (event.type) {
      case "sales:snapshot":
        handleSnapshot(event.payload);
        break;
      case "sale:live":
        handleLiveSale(event.payload);
        break;
      case "session:ready":
        set({ sessionCountries: event.payload.countries });
        break;
    }
  }

  function onSessionUpdated() {
    if (socket?.readyState === 1) {
      socket.send(JSON.stringify({ type: "session:update" }));
    }
  }

  function doConnect() {
    socket = createSocket(
      handleMessage,
      () => {
        set({ connected: true });
        if (socket) {
          socket.send(
            JSON.stringify({ type: "session:join", payload: { sessionId: getSessionId() } }),
          );
        }
      },
      () => {
        set({ connected: false });
        reconnectTimer = setTimeout(doConnect, RECONNECT_DELAY_MS);
      },
    );
  }

  return {
    connected: false,
    stats: [],
    recentSales: [],
    totalLiveSales: 0,
    month: "",
    lastSale: null,
    sessionCountries: [],

    connect: () => {
      doConnect();
      cleanupTimer = setInterval(pruneExpired, 1_000);
      window.addEventListener("sales:session-updated", onSessionUpdated);

      return () => {
        window.removeEventListener("sales:session-updated", onSessionUpdated);
        if (reconnectTimer) clearTimeout(reconnectTimer);
        if (cleanupTimer) clearInterval(cleanupTimer);
        if (socket) {
          socket.close();
          socket = null;
        }
        set({ connected: false, recentSales: [] });
      };
    },
  };
});
