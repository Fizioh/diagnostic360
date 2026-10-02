import { useAuth } from "./AuthProvider";
import { LockedScreen } from "./LockedScreen";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-muted">
        Checking session…
      </div>
    );
  }
  if (state === "locked") return <LockedScreen />;
  return <>{children}</>;
}
