import { memo, useMemo } from "react";
import type { CountryMonthlyStat } from "@repo/shared";
import type { DashboardPalette } from "@/pages/dashboard/theme";

interface Props {
  stats: CountryMonthlyStat[];
  month: string;
  palette: DashboardPalette;
  highlightCountry: string | null;
}

function fmt(n: number): string {
  return `€${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const FLAG_OFFSET = 0x1f1e6;

function countryFlag(code: string): string {
  return String.fromCodePoint(
    code.charCodeAt(0) - 65 + FLAG_OFFSET,
    code.charCodeAt(1) - 65 + FLAG_OFFSET,
  );
}

export const CountryStatsTable = memo(function CountryStatsTable({
  stats,
  month,
  palette,
  highlightCountry,
}: Props) {
  const sorted = useMemo(
    () => [...stats].sort((a, b) => b.monthRevenue - a.monthRevenue),
    [stats],
  );

  const totals = useMemo(() => {
    let monthRevenue = 0;
    let monthOrders = 0;
    let todayRevenue = 0;
    let todayOrders = 0;
    for (const s of stats) {
      monthRevenue += s.monthRevenue;
      monthOrders += s.monthOrders;
      todayRevenue += s.todayRevenue;
      todayOrders += s.todayOrders;
    }
    return { monthRevenue, monthOrders, todayRevenue, todayOrders };
  }, [stats]);

  const isDark = palette.bg === "#0f0e1a";

  const headerBg = isDark ? "#1e1d35" : "#f0f2f5";
  const highlightBg = isDark ? "rgba(255,123,84,0.15)" : "rgba(255,123,84,0.1)";
  const borderColor = palette.border;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          fontSize: "0.8rem",
          fontWeight: 600,
          color: palette.muted,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: 8,
        }}
      >
        Sales by Country — {month || "Loading..."}
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <table
          style={{
            width: "100%",
            fontSize: "0.78rem",
            borderCollapse: "collapse",
            color: palette.text,
          }}
        >
          <thead>
            <tr style={{ position: "sticky", top: 0, background: headerBg, zIndex: 1 }}>
              <th style={{ padding: "6px 6px", textAlign: "left", borderBottom: `1px solid ${borderColor}` }}>
                Country
              </th>
              <th style={{ padding: "6px 4px", textAlign: "right", borderBottom: `1px solid ${borderColor}` }}>
                Month €
              </th>
              <th style={{ padding: "6px 4px", textAlign: "right", borderBottom: `1px solid ${borderColor}` }}>
                #
              </th>
              <th style={{ padding: "6px 4px", textAlign: "right", borderBottom: `1px solid ${borderColor}` }}>
                Today €
              </th>
              <th style={{ padding: "6px 6px", textAlign: "right", borderBottom: `1px solid ${borderColor}` }}>
                #
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr
                key={s.countryCode}
                style={{
                  background: s.countryCode === highlightCountry ? highlightBg : "transparent",
                  transition: "background 0.3s",
                }}
              >
                <td style={{ padding: "5px 6px", borderBottom: `1px solid ${borderColor}`, whiteSpace: "nowrap" }}>
                  {countryFlag(s.countryCode)} {s.countryName}
                </td>
                <td style={{ padding: "5px 4px", textAlign: "right", borderBottom: `1px solid ${borderColor}`, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(s.monthRevenue)}
                </td>
                <td style={{ padding: "5px 4px", textAlign: "right", borderBottom: `1px solid ${borderColor}`, fontVariantNumeric: "tabular-nums", color: palette.muted }}>
                  {s.monthOrders}
                </td>
                <td style={{ padding: "5px 4px", textAlign: "right", borderBottom: `1px solid ${borderColor}`, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(s.todayRevenue)}
                </td>
                <td style={{ padding: "5px 6px", textAlign: "right", borderBottom: `1px solid ${borderColor}`, fontVariantNumeric: "tabular-nums", color: palette.muted }}>
                  {s.todayOrders}
                </td>
              </tr>
            ))}
          </tbody>
          {sorted.length > 0 && (
            <tfoot>
              <tr style={{ fontWeight: 700, background: headerBg }}>
                <td style={{ padding: "6px 6px", borderTop: `2px solid ${borderColor}` }}>
                  Total ({sorted.length})
                </td>
                <td style={{ padding: "6px 4px", textAlign: "right", borderTop: `2px solid ${borderColor}`, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(totals.monthRevenue)}
                </td>
                <td style={{ padding: "6px 4px", textAlign: "right", borderTop: `2px solid ${borderColor}`, fontVariantNumeric: "tabular-nums" }}>
                  {totals.monthOrders}
                </td>
                <td style={{ padding: "6px 4px", textAlign: "right", borderTop: `2px solid ${borderColor}`, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(totals.todayRevenue)}
                </td>
                <td style={{ padding: "6px 6px", textAlign: "right", borderTop: `2px solid ${borderColor}`, fontVariantNumeric: "tabular-nums" }}>
                  {totals.todayOrders}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
});
