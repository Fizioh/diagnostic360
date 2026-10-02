export const SD_INITIAL = `Design a Global Geospatial Monitoring Platform.

Initial requirements (visible):
- ~10 million assets
- Near-real-time locations
- Historical positions
- Alerts
- Multi-tenant
- Europe + Middle East regions

Write clarification questions before assuming the architecture.`;

export const SD_REVEALS: { id: string; title: string; body: string }[] = [
  {
    id: "sd-r1",
    title: "Constraint reveal #1 — Ingestion",
    body: "Peak ingest: 50k location updates/sec aggregate. 95% of assets update ≤ once per minute. Some assets burst at 1 Hz.",
  },
  {
    id: "sd-r2",
    title: "Constraint reveal #2 — Query patterns",
    body: "Primary UI: map viewport bbox queries + time slider. Secondary: tenant admin dashboards. Rare: full export per tenant (async).",
  },
  {
    id: "sd-r3",
    title: "Constraint reveal #3 — Retention & compliance",
    body: "Hot positions: 30 days at full resolution. Warm: 1 year aggregated. Cold archive 7 years. EU data residency for EU tenants.",
  },
  {
    id: "sd-r4",
    title: "Constraint reveal #4 — Failure modes",
    body: "Region pair active-active preferred but cross-region replication lag up to 30s acceptable for map UI. Alerts must not duplicate across regions.",
  },
];
