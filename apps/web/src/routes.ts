import { type ComponentType, lazy } from "react";

export interface AppRoute {
  path: string;
  label: string;
  component: ComponentType;
}

const HomePage = lazy(() => import("@/pages/HomePage"));
const SalesTablePage = lazy(() => import("@/pages/SalesTablePage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const RequestsPage = lazy(() => import("@/pages/RequestsPage"));

export const routes: AppRoute[] = [
  { path: "/", label: "Home", component: HomePage },
  { path: "/sales", label: "Sales Table", component: SalesTablePage },
  { path: "/dashboard", label: "Dashboard", component: DashboardPage },
  { path: "/requests", label: "Request Log", component: RequestsPage },
];
