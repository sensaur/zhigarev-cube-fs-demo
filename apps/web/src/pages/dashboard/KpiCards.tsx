import { memo } from "react";
import type { DashboardStyles } from "./theme";
import { fmt$ } from "./theme";

interface Props {
  totalRevenue: number;
  totalOrders: number;
  uniqueCustomers: number;
  avgOrderValue: number;
  styles: DashboardStyles;
}

export const KpiCards = memo(function KpiCards({
  totalRevenue,
  totalOrders,
  uniqueCustomers,
  avgOrderValue,
  styles: s,
}: Props) {
  const items = [
    { label: "Total Revenue", value: fmt$(totalRevenue) },
    { label: "Total Orders", value: totalOrders.toLocaleString() },
    { label: "Unique Customers", value: uniqueCustomers.toLocaleString() },
    { label: "Avg Order Value", value: fmt$(Math.round(avgOrderValue * 100) / 100) },
  ];

  return (
    <div className="row g-3 mb-4">
      {items.map((kpi) => (
        <div className="col-6 col-md-3" key={kpi.label}>
          <div style={s.card}>
            <div style={s.kpiLabel}>{kpi.label}</div>
            <div style={s.kpiValue}>{kpi.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
});
