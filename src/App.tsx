import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app/layout/AppLayout";
import { AnalyticsPage } from "./features/analytics/AnalyticsPage";
import { DataBackupPage } from "./features/data/DataBackupPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { DiagnosticFeature } from "./features/diagnostic/DiagnosticFeature";
import { RemediationPage } from "./features/remediation/RemediationPage";
import { ReadinessPage } from "./features/readiness/ReadinessPage";
import { TodayPage } from "./features/today/TodayPage";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || undefined}>
      <Routes>
        <Route path="/diagnostic/*" element={<DiagnosticFeature />} />
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="today" element={<TodayPage />} />
          <Route path="readiness" element={<ReadinessPage />} />
          <Route path="remediation" element={<RemediationPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="data" element={<DataBackupPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
