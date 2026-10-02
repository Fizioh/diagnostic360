import { useState } from "react";
import { isMissionApiConfigured } from "../../integrations/auth/missionApi";
import { useAuth } from "./AuthProvider";

export function LockedScreen() {
  const { login } = useAuth();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isMissionApiConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="max-w-md rounded-lg border border-border bg-panel p-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Mission 2027</p>
          <h1 className="mt-2 text-xl font-medium">Control Center locked</h1>
          <p className="mt-3 text-sm text-muted">
            Authentication service URL is not configured for this build. Set{" "}
            <code className="text-accent">VITE_MISSION_API_URL</code> at build time (public endpoint only — no secrets).
          </p>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = await login(passphrase);
    setBusy(false);
    if (err) setError(err);
    else setPassphrase("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-border bg-panel p-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Mission 2027</p>
        <h1 className="mt-2 text-xl font-medium">Enter access key</h1>
        <p className="mt-2 text-xs text-muted">
          Verified server-side over HTTPS. No secrets are stored in this static application.
        </p>
        <input
          type="password"
          autoComplete="current-password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="mt-4 w-full rounded border border-border bg-bg px-3 py-2 font-mono text-sm"
          placeholder="Access key / passphrase"
        />
        {error && <p className="mt-2 text-xs text-red-300/90">{error}</p>}
        <button
          type="submit"
          disabled={busy || !passphrase.trim()}
          className="mt-4 w-full rounded-md border border-accent/40 bg-accent/10 py-2 font-mono text-sm text-accent disabled:opacity-40"
        >
          {busy ? "Verifying…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
