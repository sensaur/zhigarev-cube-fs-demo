import { useMemo, useState } from "react";
import { generateSales } from "@/data/generateSales";
import type { SaleRecord } from "@/data/types";

const INITIAL_COUNTRIES = 5;
const INITIAL_RECORDS = 50;

type SortKey = keyof Pick<SaleRecord, "id" | "revenue" | "saleDate"> | "country" | "category" | "paymentType";

export default function SalesTablePage() {
  const [countryCount, setCountryCount] = useState(INITIAL_COUNTRIES);
  const [recordCount, setRecordCount] = useState(INITIAL_RECORDS);
  const [sortKey, setSortKey] = useState<SortKey>("saleDate");
  const [sortAsc, setSortAsc] = useState(false);

  const data = useMemo(
    () => generateSales(countryCount, recordCount),
    [countryCount, recordCount],
  );

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "id":
          cmp = a.id - b.id;
          break;
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

  const totalRevenue = data.reduce((sum, r) => sum + r.revenue, 0);

  const columns: { key: SortKey; label: string }[] = [
    { key: "id", label: "#" },
    { key: "country", label: "Country" },
    { key: "category", label: "Category" },
    { key: "revenue", label: "Revenue (€)" },
    { key: "paymentType", label: "Payment" },
    { key: "saleDate", label: "Date" },
  ];

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-3" style={{ fontSize: "1.4rem", fontWeight: 600 }}>
        Sales Table
      </h1>

      <div className="d-flex gap-3 align-items-end mb-3 flex-wrap">
        <div>
          <label className="form-label mb-1 small text-muted">Countries</label>
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: 90 }}
            min={1}
            max={27}
            value={countryCount}
            onChange={(e) => setCountryCount(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="form-label mb-1 small text-muted">Records</label>
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: 110 }}
            min={1}
            max={10000}
            value={recordCount}
            onChange={(e) => setRecordCount(Number(e.target.value))}
          />
        </div>
        <div className="text-muted small align-self-center pt-3">
          Total: <strong>€{totalRevenue.toLocaleString()}</strong>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
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
                <td className="text-muted">{r.id}</td>
                <td>
                  <span className="me-1" style={{ fontSize: "0.75rem" }}>
                    {r.country.code}
                  </span>
                  {r.country.name}
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
