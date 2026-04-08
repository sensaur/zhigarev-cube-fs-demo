import { useMemo } from "react";
import { useSalesStore } from "@/store/salesStore";
import { useThemeStore } from "@/store/themeStore";
import { getPalette, buildStyles } from "./dashboard/theme";
import { KpiCards } from "./dashboard/KpiCards";
import { MonthlyRevenueChart } from "./dashboard/MonthlyRevenueChart";
import { PaymentDonut } from "./dashboard/PaymentDonut";
import { CountryBarChart } from "./dashboard/CountryBarChart";
import { CategoryBarChart } from "./dashboard/CategoryBarChart";

export default function DashboardPage() {
  const data = useSalesStore((s) => s.records);
  const theme = useThemeStore((s) => s.theme);

  const palette = useMemo(() => getPalette(theme), [theme]);
  const styles = useMemo(() => buildStyles(palette), [palette]);

  const kpis = useMemo(() => {
    const totalRevenue = data.reduce((s, r) => s + r.revenue, 0);
    const totalOrders = data.length;
    const uniqueCustomers = new Set(data.map((r) => r.customerId)).size;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { totalRevenue, totalOrders, uniqueCustomers, avgOrderValue };
  }, [data]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: number }>();
    for (const r of data) {
      const key = r.saleDate.slice(0, 7);
      const entry = map.get(key) ?? { revenue: 0, orders: 0 };
      entry.revenue += r.revenue;
      entry.orders += 1;
      map.set(key, entry);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, ...v }));
  }, [data]);

  const paymentData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of data) {
      map.set(r.paymentType.name, (map.get(r.paymentType.name) ?? 0) + r.revenue);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const countryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of data) {
      map.set(r.country.code, (map.get(r.country.code) ?? 0) + r.revenue);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [data]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of data) {
      map.set(r.category.name, (map.get(r.category.name) ?? 0) + r.revenue);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  return (
    <div style={styles.page}>
      <KpiCards {...kpis} styles={styles} />

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-7">
          <MonthlyRevenueChart data={monthlyData} palette={palette} styles={styles} />
        </div>
        <div className="col-12 col-lg-5">
          <PaymentDonut data={paymentData} palette={palette} styles={styles} />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-lg-6">
          <CountryBarChart data={countryData} palette={palette} styles={styles} />
        </div>
        <div className="col-12 col-lg-6">
          <CategoryBarChart data={categoryData} palette={palette} styles={styles} />
        </div>
      </div>
    </div>
  );
}
