import { type ComponentType, lazy } from "react";

export interface AppRoute {
  path: string;
  label: string;
  component: ComponentType;
}

const HomePage = lazy(() => import("@/pages/HomePage"));
const SalesTablePage = lazy(() => import("@/pages/SalesTablePage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const LiveMapPage = lazy(() => import("@/pages/LiveMapPage"));
const RequestsPage = lazy(() => import("@/pages/RequestsPage"));
const AiChatPage = lazy(() => import("@/pages/AiChatPage"));

export const routes: AppRoute[] = [
  { path: "/", label: "Home", component: HomePage },
  { path: "/sales", label: "Sales Table", component: SalesTablePage },
  { path: "/dashboard", label: "Dashboard", component: DashboardPage },
  { path: "/live-map", label: "Live Map", component: LiveMapPage },
  { path: "/requests", label: "Request Log", component: RequestsPage },
  { path: "/ai-chat", label: "AI Chat", component: AiChatPage },
];
