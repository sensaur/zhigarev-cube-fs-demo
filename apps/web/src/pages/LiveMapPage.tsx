import { useEffect, useMemo } from "react";
import { useLiveMapStore } from "@/store/liveMapStore";
import { useThemeStore } from "@/store/themeStore";
import { getPalette, buildStyles } from "./dashboard/theme";
import { EuropeMap } from "./live-map/EuropeMap";
import { CountryStatsTable } from "./live-map/CountryStatsTable";

export default function LiveMapPage() {
  const connect = useLiveMapStore((s) => s.connect);
  const connected = useLiveMapStore((s) => s.connected);
  const stats = useLiveMapStore((s) => s.stats);
  const recentSales = useLiveMapStore((s) => s.recentSales);
  const totalLiveSales = useLiveMapStore((s) => s.totalLiveSales);
  const month = useLiveMapStore((s) => s.month);
  const lastSale = useLiveMapStore((s) => s.lastSale);

  const theme = useThemeStore((s) => s.theme);
  const palette = useMemo(() => getPalette(theme), [theme]);
  const styles = useMemo(() => buildStyles(palette), [palette]);

  useEffect(() => {
    const disconnect = connect();
    return disconnect;
  }, [connect]);

  const highlightCountry = lastSale?.countryCode ?? null;

  return (
    <div style={{ ...styles.page, display: "flex", flexDirection: "column", padding: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "10px 20px",
          borderBottom: `1px solid ${palette.border}`,
          fontSize: "0.82rem",
          color: palette.muted,
          background: palette.card,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontWeight: 600,
            color: connected ? "#56c596" : "#ff6b6b",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: connected ? "#56c596" : "#ff6b6b",
              display: "inline-block",
              boxShadow: connected ? "0 0 6px #56c596" : "0 0 6px #ff6b6b",
            }}
          />
          {connected ? "Live" : "Reconnecting..."}
        </span>

        <span>Total sales: <strong style={{ color: palette.text }}>{totalLiveSales}</strong></span>

        {lastSale && (
          <span style={{ marginLeft: "auto" }}>
            Last: <strong style={{ color: "#ff7b54" }}>€{lastSale.revenue.toFixed(2)}</strong>{" "}
            — {lastSale.countryName} · {lastSale.category} · {lastSale.paymentType}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div
          style={{
            flex: "1 1 65%",
            minWidth: 0,
            background: palette.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <EuropeMap recentSales={recentSales} palette={palette} />
        </div>

        <div
          style={{
            flex: "0 0 35%",
            minWidth: 300,
            maxWidth: 520,
            background: palette.card,
            borderLeft: `1px solid ${palette.border}`,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <CountryStatsTable
            stats={stats}
            month={month}
            palette={palette}
            highlightCountry={highlightCountry}
          />
        </div>
      </div>
    </div>
  );
}
