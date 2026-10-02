export interface IncidentAction {
  id: string;
  label: string;
  evidence: string;
}

export const INCIDENT_ACTIONS: IncidentAction[] = [
  {
    id: "traffic",
    label: "Inspect traffic",
    evidence:
      "Traffic volume stable (+2% vs baseline). No spike correlating with latency jump. Not a load incident.",
  },
  {
    id: "logs",
    label: "Inspect application logs",
    evidence:
      "Logs show repeated ORM queries in a loop during /projects/:id/routes serialization. Permission checks added in latest deploy.",
  },
  {
    id: "db-metrics",
    label: "Inspect DB metrics",
    evidence: "DB CPU 80%+, connection pool near limit. Many identical SELECTs per request.",
  },
  {
    id: "slow-queries",
    label: "Inspect slow queries",
    evidence:
      "Top query: permission computation per route row. Count went from ~3 queries/request to ~3 + N.",
  },
  {
    id: "deploy",
    label: "Compare deployment",
    evidence:
      "Deploy 14:02 introduced computePermissions(route) inside serializer loop. Feature flag not used.",
  },
  {
    id: "rollback",
    label: "Roll back",
    evidence:
      "Rollback to previous release: p95 returns to ~240ms within 8 minutes. Error rate normalizes.",
  },
  {
    id: "deps",
    label: "Inspect external dependencies",
    evidence: "Third-party geocoding latency normal. No external timeout pattern.",
  },
];

export const INCIDENT_BRIEF = `14:02 deployment completed
14:07 p95 latency 220ms → 4.6s
14:10 DB connections 80%
14:13 error rate 0.2% → 5%

You own the service. What do you do?`;
