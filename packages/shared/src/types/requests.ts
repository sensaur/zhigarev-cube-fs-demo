export interface RequestLogEntry {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  responseTimeMs: number;
  ip: string | null;
  userAgent: string | null;
  queryParams: string | null;
  contentLength: number | null;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RequestStatsOverview {
  totalRequests: number;
  avgResponseMs: number;
  maxResponseMs: number;
  minResponseMs: number;
}

export interface EndpointStat {
  method: string;
  path: string;
  count: number;
  avgResponseMs: number;
}

export interface StatusBreakdown {
  statusCode: number;
  count: number;
}

export interface HourlyTraffic {
  hour: string;
  count: number;
  avgResponseMs: number;
}

export interface RequestStatsResponse {
  period: { since: string; hours: number };
  overview: RequestStatsOverview;
  topEndpoints: EndpointStat[];
  statusBreakdown: StatusBreakdown[];
  hourlyTraffic: HourlyTraffic[];
}
