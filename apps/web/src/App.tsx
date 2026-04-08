import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { routes } from "@/routes";
import AppNavbar from "@/components/AppNavbar";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function App() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
        <AppNavbar />
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="d-flex justify-content-center align-items-center flex-grow-1">
                <div className="spinner-border text-primary" role="status" />
              </div>
            }
          >
            <Routes>
              {routes.map((r) => (
                <Route key={r.path} path={r.path} element={<r.component />} />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}
