import { useState, useEffect, useCallback, useMemo } from "react";
import { useThemeStore } from "@/store/themeStore";
import { getPalette, buildStyles } from "./dashboard/theme";
import { apiFetch } from "@/lib/api";
import type {
  RequestLogEntry,
  PaginatedResponse,
  RequestStatsResponse,
} from "@repo/shared";

const METHODS = ["", "GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const titleStyle: React.CSSProperties = { fontSize: "1.4rem", fontWeight: 600 };

function statusBadge(code: number) {
  if (code < 300) return "bg-success-subtle text-success";
  if (code < 400) return "bg-info-subtle text-info";
  if (code < 500) return "bg-warning-subtle text-warning";
  return "bg-danger-subtle text-danger";
}

function methodBadge(method: string) {
  switch (method) {
    case "GET":    return "bg-primary-subtle text-primary";
    case "POST":   return "bg-success-subtle text-success";
    case "PUT":    return "bg-warning-subtle text-warning";
    case "DELETE": return "bg-danger-subtle text-danger";
    default:       return "bg-secondary-subtle text-secondary";
  }
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function StatsCards({ stats }: { stats: RequestStatsResponse | null }) {
  const theme = useThemeStore((s) => s.theme);
  const palette = useMemo(() => getPalette(theme), [theme]);
  const s = useMemo(() => buildStyles(palette), [palette]);

  if (!stats) return null;
  const { overview } = stats;

  const items = [
    { label: "Total Requests", value: overview.totalRequests.toLocaleString() },
    { label: "Avg Response", value: `${overview.avgResponseMs}ms` },
    { label: "Max Response", value: `${overview.maxResponseMs}ms` },
    { label: "Endpoints Hit", value: stats.topEndpoints.length.toString() },
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
}

function TopEndpoints({ stats }: { stats: RequestStatsResponse | null }) {
  const theme = useThemeStore((s) => s.theme);
  const palette = useMemo(() => getPalette(theme), [theme]);
  const s = useMemo(() => buildStyles(palette), [palette]);

  if (!stats || stats.topEndpoints.length === 0) return null;

  return (
    <div style={s.panel} className="mb-4">
      <div style={s.sectionTitle}>Top Endpoints</div>
      <table className="table table-sm table-hover mb-0" style={{ fontSize: "0.85rem" }}>
        <thead>
          <tr>
            <th className="text-muted fw-semibold">Method</th>
            <th className="text-muted fw-semibold">Path</th>
            <th className="text-muted fw-semibold text-end">Hits</th>
            <th className="text-muted fw-semibold text-end">Avg ms</th>
          </tr>
        </thead>
        <tbody>
          {stats.topEndpoints.map((ep) => (
            <tr key={`${ep.method}-${ep.path}`}>
              <td><span className={`badge ${methodBadge(ep.method)}`}>{ep.method}</span></td>
              <td className="font-monospace">{ep.path}</td>
              <td className="text-end fw-medium">{ep.count}</td>
              <td className="text-end">{ep.avgResponseMs}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBreakdown({ stats }: { stats: RequestStatsResponse | null }) {
  if (!stats || stats.statusBreakdown.length === 0) return null;

  return (
    <div className="d-flex gap-2 mb-4 flex-wrap">
      {stats.statusBreakdown.map((sb) => (
        <span key={sb.statusCode} className={`badge ${statusBadge(sb.statusCode)} px-3 py-2`}>
          {sb.statusCode}: {sb.count}
        </span>
      ))}
    </div>
  );
}

export default function RequestsPage() {
  const [logs, setLogs] = useState<RequestLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<RequestStatsResponse | null>(null);

  const [methodFilter, setMethodFilter] = useState("");
  const [pathFilter, setPathFilter] = useState("");
  const limit = 20;

  const fetchLogs = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (methodFilter) params.set("method", methodFilter);
      if (pathFilter) params.set("path", pathFilter);

      const data = await apiFetch<PaginatedResponse<RequestLogEntry>>(
        `/api/requests?${params}`,
      );
      setLogs(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }, [methodFilter, pathFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiFetch<RequestStatsResponse>("/api/requests/stats?hours=24");
      setStats(data);
    } catch {
      /* stats are non-critical */
    }
  }, []);

  useEffect(() => {
    void fetchLogs(page);
  }, [page, fetchLogs]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setPage(1);
  }, [methodFilter, pathFilter]);

  function handlePrev() { if (page > 1) setPage(page - 1); }
  function handleNext() { if (page < totalPages) setPage(page + 1); }

  return (
    <div className="container-fluid py-4">
      <h1 className="mb-4" style={titleStyle}>Request Log</h1>

      <StatsCards stats={stats} />
      <StatusBreakdown stats={stats} />
      <TopEndpoints stats={stats} />

      <div className="d-flex gap-3 align-items-end mb-3 flex-wrap">
        <div>
          <label htmlFor="method-filter" className="form-label mb-1 small text-muted">Method</label>
          <select
            id="method-filter"
            className="form-select form-select-sm"
            style={{ width: 120 }}
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>{m || "All"}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="path-filter" className="form-label mb-1 small text-muted">Path contains</label>
          <input
            id="path-filter"
            type="text"
            className="form-control form-control-sm"
            style={{ width: 200 }}
            placeholder="/api/sales"
            value={pathFilter}
            onChange={(e) => setPathFilter(e.target.value)}
          />
        </div>
        <div className="text-muted small align-self-center pt-3">
          {total} total log{total !== 1 ? "s" : ""}
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm align-self-center mt-auto"
          onClick={() => { void fetchLogs(page); void fetchStats(); }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2" role="alert">{error}</div>
      )}

      {loading && logs.length === 0 ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th className="text-muted fw-semibold">Time</th>
                  <th className="text-muted fw-semibold">Method</th>
                  <th className="text-muted fw-semibold">Path</th>
                  <th className="text-muted fw-semibold">Status</th>
                  <th className="text-muted fw-semibold text-end">Response</th>
                  <th className="text-muted fw-semibold text-end">Size</th>
                  <th className="text-muted fw-semibold">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-muted text-nowrap">{formatTime(log.createdAt)}</td>
                    <td>
                      <span className={`badge ${methodBadge(log.method)}`}>{log.method}</span>
                    </td>
                    <td className="font-monospace">
                      {log.path}
                      {log.queryParams && (
                        <span className="text-muted ms-1" style={{ fontSize: "0.75rem" }}>
                          {log.queryParams}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${statusBadge(log.statusCode)}`}>{log.statusCode}</span>
                    </td>
                    <td className="text-end">{log.responseTimeMs}ms</td>
                    <td className="text-end text-muted">
                      {log.contentLength != null ? `${(log.contentLength / 1024).toFixed(1)}KB` : "—"}
                    </td>
                    <td className="text-muted font-monospace" style={{ fontSize: "0.8rem" }}>
                      {log.ip ?? "—"}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">No logs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className="d-flex align-items-center gap-3 mt-3">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={page <= 1}
                onClick={handlePrev}
              >
                Previous
              </button>
              <span className="text-muted small">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={handleNext}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
