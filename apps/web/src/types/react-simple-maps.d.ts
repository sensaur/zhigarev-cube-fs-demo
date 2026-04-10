declare module "react-simple-maps" {
  import type { ComponentType, ReactNode } from "react";

  interface ProjectionConfig {
    center?: [number, number];
    scale?: number;
    rotate?: [number, number, number];
    parallels?: [number, number];
  }

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: ProjectionConfig;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  interface GeographiesChildrenArgs {
    geographies: GeographyType[];
  }

  interface GeographiesProps {
    geography: string | Record<string, unknown>;
    children: (args: GeographiesChildrenArgs) => ReactNode;
  }

  interface GeographyType {
    id: string;
    rsmKey: string;
    type: string;
    properties: Record<string, unknown>;
    geometry: Record<string, unknown>;
  }

  interface GeoStyleState {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
  }

  interface GeographyStyle {
    default?: GeoStyleState;
    hover?: GeoStyleState;
    pressed?: GeoStyleState;
  }

  interface GeographyProps {
    geography: GeographyType;
    style?: GeographyStyle;
    key?: string;
    onClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
  }

  interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<MarkerProps>;
}
