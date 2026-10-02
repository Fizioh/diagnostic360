import { Link } from "react-router-dom";

export function DiagnosticHubPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-[10px] font-medium tracking-[0.2em] text-muted uppercase">Mission 2027</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-accent">Diagnostic</h1>
      <p className="mt-2 text-sm text-muted">Choose how you want to establish or validate engineering readiness.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          to="/diagnostic/light"
          className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-5 hover:border-amber-400/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-400/90">Light Diagnostic</p>
          <p className="mt-2 text-lg font-medium text-accent">Provisional baseline</p>
          <p className="mt-2 text-xs text-muted">15–20 min · ~40 scenario questions · QCM only</p>
        </Link>
        <Link
          to="/diagnostic/360"
          className="rounded-lg border border-accent/30 bg-accent/5 p-5 hover:border-accent/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-accent/90">Diagnostic 360</p>
          <p className="mt-2 text-lg font-medium text-accent">Validated evidence</p>
          <p className="mt-2 text-xs text-muted">Deep practical assessment · external review</p>
        </Link>
      </div>
    </div>
  );
}
