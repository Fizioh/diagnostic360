import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./app/layout/AppLayout";
import { AnalyticsPage } from "./features/analytics/AnalyticsPage";
import { DataBackupPage } from "./features/data/DataBackupPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { DiagnosticHubPage } from "./features/diagnostic/DiagnosticHubPage";
import { DiagnosticFeature } from "./features/diagnostic/DiagnosticFeature";
import { LightDiagnosticFeature } from "./features/lightDiagnostic/LightDiagnosticFeature";
import { RemediationPage } from "./features/remediation/RemediationPage";
import { ReadinessPage } from "./features/readiness/ReadinessPage";
import { TodayPage } from "./features/today/TodayPage";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || undefined}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="today" element={<TodayPage />} />
          <Route path="diagnostic" element={<DiagnosticHubPage />} />
          <Route path="diagnostic/360/*" element={<DiagnosticFeature />} />
          <Route path="diagnostic/light/*" element={<LightDiagnosticFeature />} />
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
