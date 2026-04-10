import { memo, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { GEO_URL, EU_COUNTRY_COORDS, EU_NUMERIC_IDS } from "@/data/europeGeo";
import type { RecentSale } from "@/store/liveMapStore";
import type { DashboardPalette } from "@/pages/dashboard/theme";

interface Props {
  recentSales: RecentSale[];
  palette: DashboardPalette;
}

const PROJECTION_CONFIG = {
  center: [15, 53] as [number, number],
  scale: 700,
};

const MARKER_CSS = `
@keyframes salePulse {
  0%   { r: 5;  opacity: 0.9; }
  50%  { r: 18; opacity: 0.3; }
  100% { r: 24; opacity: 0;   }
}
@keyframes saleFadeIn {
  0%   { opacity: 0; transform: translateY(4px); }
  20%  { opacity: 1; transform: translateY(0); }
  80%  { opacity: 1; }
  100% { opacity: 0; }
}
.sale-ring  { animation: salePulse 4s ease-out forwards; }
.sale-label { animation: saleFadeIn 4s ease-out forwards; }
`;

function MarkerDot({ sale }: { sale: RecentSale }) {
  const coords = EU_COUNTRY_COORDS[sale.countryCode];
  if (!coords) return null;

  return (
    <Marker coordinates={coords}>
      <circle className="sale-ring" fill="#ff7b54" />
      <circle r={4} fill="#ff7b54" opacity={0.9} />
      <text
        textAnchor="middle"
        y={-16}
        className="sale-label"
        style={{
          fontFamily: "system-ui",
          fontSize: 10,
          fontWeight: 600,
          fill: "#ff7b54",
        }}
      >
        €{sale.revenue.toFixed(0)}
      </text>
    </Marker>
  );
}

export const EuropeMap = memo(function EuropeMap({ recentSales, palette }: Props) {
  const isDark = palette.bg === "#0f0e1a";

  const geoStyle = useMemo(
    () => ({
      eu: {
        default: { fill: isDark ? "#2a2845" : "#d0d8e8", stroke: palette.border, strokeWidth: 0.5 },
        hover: { fill: isDark ? "#3a3865" : "#b8c4db", stroke: palette.border, strokeWidth: 0.5 },
        pressed: { fill: isDark ? "#3a3865" : "#b8c4db", stroke: palette.border, strokeWidth: 0.5 },
      },
      other: {
        default: { fill: isDark ? "#1a1932" : "#e8ecf0", stroke: palette.border, strokeWidth: 0.3, opacity: 0.5 },
        hover: { fill: isDark ? "#1a1932" : "#e8ecf0", stroke: palette.border, strokeWidth: 0.3, opacity: 0.5 },
        pressed: { fill: isDark ? "#1a1932" : "#e8ecf0", stroke: palette.border, strokeWidth: 0.3, opacity: 0.5 },
      },
    }),
    [isDark, palette.border],
  );

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <style>{MARKER_CSS}</style>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={PROJECTION_CONFIG}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const numericId = geo.id as string;
              const isEU = EU_NUMERIC_IDS.has(numericId);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={isEU ? geoStyle.eu : geoStyle.other}
                />
              );
            })
          }
        </Geographies>

        {recentSales.map((sale) => (
          <MarkerDot key={sale.id} sale={sale} />
        ))}
      </ComposableMap>
    </div>
  );
});
