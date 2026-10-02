import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { AuthGate } from "./features/auth/AuthGate";
import { AuthProvider } from "./features/auth/AuthProvider";
import { LocaleProvider } from "./app/i18n/LocaleProvider";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocaleProvider>
      <AuthProvider>
        <AuthGate>
          <App />
        </AuthGate>
      </AuthProvider>
    </LocaleProvider>
  </StrictMode>,
);
