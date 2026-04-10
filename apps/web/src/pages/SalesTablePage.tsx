import { useRef, useMemo, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { SaleRecord } from "@repo/shared";
import { useSalesStore, MAX_COUNTRIES, MAX_RECORDS } from "@/store/salesStore";
import BsTooltip from "@/components/BsTooltip";

type SortKey = keyof Pick<SaleRecord, "revenue" | "saleDate"> | "country" | "category" | "paymentType";

const columns: { key: SortKey; label: string }[] = [
  { key: "country", label: "Country" },
  { key: "category", label: "Category" },
  { key: "revenue", label: "Revenue (€)" },
  { key: "paymentType", label: "Payment" },
  { key: "saleDate", label: "Date" },
];

const ROW_HEIGHT = 36;

const titleStyle: React.CSSProperties = { fontSize: "1.4rem", fontWeight: 600 };
const countryInputStyle: React.CSSProperties = { width: 90 };
const recordInputStyle: React.CSSProperties = { width: 110 };
const tableStyle: React.CSSProperties = { fontSize: "0.85rem" };
const thStyle: React.CSSProperties = {
  cursor: "pointer",
  userSelect: "none",
  whiteSpace: "nowrap",
  background: "var(--bs-body-bg)",
};
const pageStyle: React.CSSProperties = { display: "flex", flexDirection: "column", height: "100vh" };
const scrollAreaStyle: React.CSSProperties = { flex: 1, overflow: "auto", minHeight: 0 };
const spacerTd: React.CSSProperties = { padding: 0, border: "none", lineHeight: 0 };

function CrashTest() {
  const [crash, setCrash] = useState(false);
  if (crash) throw new Error("CrashTest: intentional render error");
  return (
    <button type="button" className="btn btn-outline-danger btn-sm m-2" onClick={() => setCrash(true)}>
      Crash test
    </button>
  );
}

function compareSaleRecords(a: SaleRecord, b: SaleRecord, key: SortKey): number {
  switch (key) {
    case "revenue": return a.revenue - b.revenue;
    case "saleDate": return a.saleDate.localeCompare(b.saleDate);
    case "country": return a.country.name.localeCompare(b.country.name);
    case "category": return a.category.name.localeCompare(b.category.name);
    case "paymentType": return a.paymentType.name.localeCompare(b.paymentType.name);
  }
}

export default function SalesTablePage() {
  const countryCount = useSalesStore((s) => s.countryCount);
  const recordCount = useSalesStore((s) => s.recordCount);
  const data = useSalesStore((s) => s.records);
  const loading = useSalesStore((s) => s.loading);
  const error = useSalesStore((s) => s.error);
  const liveCount = useSalesStore((s) => s.liveCount);
  const setCountryCount = useSalesStore((s) => s.setCountryCount);
  const setRecordCount = useSalesStore((s) => s.setRecordCount);
  const refresh = useSalesStore((s) => s.refresh);

  const [sortKey, setSortKey] = useState<SortKey>("saleDate");
  const [sortAsc, setSortAsc] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleCountryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const n = parseInt(e.target.value, 10);
    if (!Number.isNaN(n)) setCountryCount(n);
  }

  function handleRecordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const n = parseInt(e.target.value, 10);
    if (!Number.isNaN(n)) setRecordCount(n);
  }

  const totalRevenue = useMemo(
    () => data.reduce((sum, r) => sum + r.revenue, 0),
    [data],
  );

  const sorted = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const cmp = compareSaleRecords(a, b, sortKey);
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  }, [data, sortKey, sortAsc]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: sorted.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0]!.start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1]!.end
      : 0;

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
       <CrashTest />

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
          {liveCount > 0 && (
            <span className="ms-2 text-success">+{liveCount} live</span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm align-self-center"
          onClick={refresh}
          disabled={loading}
          style={{ whiteSpace: "nowrap" }}
        >
          {loading ? "Loading…" : "Refresh Data"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2 flex-shrink-0" role="alert">
          {error}
        </div>
      )}

      <div ref={scrollRef} style={scrollAreaStyle}>
        {loading && data.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading…</span>
            </div>
          </div>
        ) : (
        <table className="table table-sm table-hover align-middle mb-0" style={tableStyle}>
          <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
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
            {paddingTop > 0 && (
              <tr aria-hidden>
                <td colSpan={columns.length} style={{ ...spacerTd, height: paddingTop }} />
              </tr>
            )}
            {virtualItems.map((vRow) => {
              const r = sorted[vRow.index]!;
              return (
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
              );
            })}
            {paddingBottom > 0 && (
              <tr aria-hidden>
                <td colSpan={columns.length} style={{ ...spacerTd, height: paddingBottom }} />
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
