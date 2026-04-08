import { type ComponentType, lazy } from "react";

export interface AppRoute {
  path: string;
  label: string;
  component: ComponentType;
}

const HomePage = lazy(() => import("@/pages/HomePage"));
const SalesTablePage = lazy(() => import("@/pages/SalesTablePage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));

export const routes: AppRoute[] = [
  { path: "/", label: "Home", component: HomePage },
  { path: "/sales", label: "Sales Table", component: SalesTablePage },
  { path: "/dashboard", label: "Dashboard", component: DashboardPage },
];
