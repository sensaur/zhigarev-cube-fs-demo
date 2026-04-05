import { useMemo, useState } from "react";
import { generateSales } from "@/data/generateSales";
import type { SaleRecord } from "@/data/types";
import BsTooltip from "@/components/BsTooltip";

const INITIAL_COUNTRIES = 5;
const INITIAL_RECORDS = 50;
const MAX_COUNTRIES = 27;
const MAX_RECORDS = 10000;

type SortKey = keyof Pick<SaleRecord, "revenue" | "saleDate"> | "country" | "category" | "paymentType";

const columns: { key: SortKey; label: string }[] = [
  { key: "country", label: "Country" },
  { key: "category", label: "Category" },
  { key: "revenue", label: "Revenue (€)" },
  { key: "paymentType", label: "Payment" },
  { key: "saleDate", label: "Date" },
];

const titleStyle: React.CSSProperties = { fontSize: "1.4rem", fontWeight: 600 };
const countryInputStyle: React.CSSProperties = { width: 90 };
const recordInputStyle: React.CSSProperties = { width: 110 };
const tableStyle: React.CSSProperties = { fontSize: "0.85rem" };
const thStyle: React.CSSProperties = {
  cursor: "pointer",
  userSelect: "none",
  whiteSpace: "nowrap",
  position: "sticky",
  top: 0,
  background: "var(--bs-table-bg, #fff)",
  zIndex: 1,
};
const pageStyle: React.CSSProperties = { display: "flex", flexDirection: "column", height: "100vh" };
const scrollAreaStyle: React.CSSProperties = { flex: 1, overflow: "auto", minHeight: 0 };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function SalesTablePage() {
  const [countryCount, setCountryCount] = useState(INITIAL_COUNTRIES);
  const [recordCount, setRecordCount] = useState(INITIAL_RECORDS);
  const [sortKey, setSortKey] = useState<SortKey>("saleDate");
  const [sortAsc, setSortAsc] = useState(false);

  function handleCountryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const n = parseInt(e.target.value, 10);
    if (!Number.isNaN(n)) setCountryCount(clamp(n, 1, MAX_COUNTRIES));
  }

  function handleRecordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const n = parseInt(e.target.value, 10);
    if (!Number.isNaN(n)) setRecordCount(clamp(n, 1, MAX_RECORDS));
  }

  const data = useMemo(
    () => generateSales(countryCount, recordCount),
    [countryCount, recordCount],
  );

  const totalRevenue = useMemo(
    () => data.reduce((sum, r) => sum + r.revenue, 0),
    [data],
  );

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "revenue":
          cmp = a.revenue - b.revenue;
          break;
        case "saleDate":
          cmp = a.saleDate.localeCompare(b.saleDate);
          break;
        case "country":
          cmp = a.country.name.localeCompare(b.country.name);
          break;
        case "category":
          cmp = a.category.name.localeCompare(b.category.name);
          break;
        case "paymentType":
          cmp = a.paymentType.name.localeCompare(b.paymentType.name);
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [data, sortKey, sortAsc]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return null;
    return sortAsc ? " ↑" : " ↓";
  }

  return (
    <div className="container-fluid py-4" style={pageStyle}>
      <h1 className="mb-3" style={titleStyle}>Sales Table</h1>

      <div className="d-flex gap-3 align-items-end mb-3 flex-wrap flex-shrink-0">
        <div>
          <label htmlFor="country-count" className="form-label mb-1 small text-muted">Countries</label>
          <input
            id="country-count"
            type="number"
            className="form-control form-control-sm"
            style={countryInputStyle}
            min={1}
            max={MAX_COUNTRIES}
            value={countryCount}
            onChange={handleCountryChange}
          />
        </div>
        <div>
          <label htmlFor="record-count" className="form-label mb-1 small text-muted">Records</label>
          <input
            id="record-count"
            type="number"
            className="form-control form-control-sm"
            style={recordInputStyle}
            min={1}
            max={MAX_RECORDS}
            value={recordCount}
            onChange={handleRecordChange}
          />
        </div>
        <div className="text-muted small align-self-center pt-3">
          Total: <strong>€{totalRevenue.toLocaleString()}</strong>
        </div>
      </div>

      <div style={scrollAreaStyle}>
        <table className="table table-sm table-hover align-middle mb-0" style={tableStyle}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={thStyle}
                  className="text-muted fw-semibold"
                >
                  {col.label}{sortIndicator(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.id}>
                <td>
                  <BsTooltip title={r.country.name}><span>{r.country.code}</span></BsTooltip>
                </td>
                <td>{r.category.name}</td>
                <td className="text-end fw-medium">€{r.revenue}</td>
                <td>
                  <span
                    className={`badge ${r.paymentType.id === "cash" ? "bg-success-subtle text-success" : "bg-primary-subtle text-primary"}`}
                  >
                    {r.paymentType.name}
                  </span>
                </td>
                <td className="text-muted">{r.saleDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
