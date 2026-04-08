export const ACCENT = {
  barFill: "#6b8cce",
  lineStroke: "#ff7b54",
  pie: ["#ff8c42", "#4da8da", "#56c596", "#ff6b6b", "#c084fc", "#facc15"],
  countryBar: "#5bc0de",
  category: ["#ff8c42", "#e8703a", "#d65432", "#56c596", "#4da88a", "#3d8b6e", "#2d6e52"],
} as const;

const palettes = {
  dark: {
    bg: "#0f0e1a",
    card: "#1a1932",
    border: "#2a2845",
    text: "#e2e0f0",
    muted: "#8b89a6",
    grid: "#2a2845",
    tooltipBg: "#1e1d35",
  },
  light: {
    bg: "#f8f9fa",
    card: "#ffffff",
    border: "#dee2e6",
    text: "#212529",
    muted: "#6c757d",
    grid: "#e9ecef",
    tooltipBg: "#ffffff",
  },
} as const;

export type DashboardPalette = (typeof palettes)[keyof typeof palettes];

export function getPalette(theme: "light" | "dark"): DashboardPalette {
  return palettes[theme];
}

export function buildStyles(c: DashboardPalette) {
  return {
    page: {
      background: c.bg,
      color: c.text,
      minHeight: "100%",
      flex: 1,
      padding: "24px 28px",
    } satisfies React.CSSProperties,

    card: {
      background: c.card,
      border: `1px solid ${c.border}`,
      borderRadius: 10,
      padding: "18px 22px",
    } satisfies React.CSSProperties,

    panel: {
      background: c.card,
      border: `1px solid ${c.border}`,
      borderRadius: 10,
      padding: "20px 24px",
    } satisfies React.CSSProperties,

    kpiLabel: {
      fontSize: "0.75rem",
      color: c.muted,
      fontWeight: 500,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      marginBottom: 4,
    } satisfies React.CSSProperties,

    kpiValue: {
      fontSize: "1.65rem",
      fontWeight: 700,
      lineHeight: 1.2,
    } satisfies React.CSSProperties,

    sectionTitle: {
      fontSize: "0.95rem",
      fontWeight: 600,
      marginBottom: 16,
    } satisfies React.CSSProperties,

    tooltip: {
      contentStyle: {
        background: c.tooltipBg,
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        fontSize: "0.8rem",
        color: c.text,
      },
      itemStyle: { color: c.text },
      labelStyle: { color: c.muted, fontWeight: 600, marginBottom: 4 },
    },

    tick: { fill: c.muted, fontSize: 11 },
    tickSm: { fill: c.muted, fontSize: 10 },
  };
}

export type DashboardStyles = ReturnType<typeof buildStyles>;

export function fmt$(n: number): string {
  return `€${n.toLocaleString("en-US")}`;
}
