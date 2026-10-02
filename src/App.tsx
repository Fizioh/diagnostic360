import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app/layout/AppLayout";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { DiagnosticFeature } from "./features/diagnostic/DiagnosticFeature";
import { ReadinessPage } from "./features/readiness/ReadinessPage";
import { TodayPage } from "./features/today/TodayPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/diagnostic/*" element={<DiagnosticFeature />} />
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="today" element={<TodayPage />} />
          <Route path="readiness" element={<ReadinessPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
