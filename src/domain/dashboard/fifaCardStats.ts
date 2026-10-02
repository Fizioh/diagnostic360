import type { DashboardModel } from "./buildDashboardModel";
import type { ReadinessDomain } from "../types";

export interface FifaRadarStat {
  label: string;
  value: number | null;
}

const SHORT: Partial<Record<ReadinessDomain, string>> = {
  "react-typescript": "REA",
  django: "DJG",
  "sql-postgresql": "SQL",
  algorithms: "ALG",
  "system-design": "SYS",
  "distributed-systems": "DST",
  "production-devops": "PRD",
  "ai-engineering": "AIE",
  gis: "GIS",
  "technical-english": "ENG",
  "senior-communication": "COM",
};

export function selectFifaRadarStats(domainBars: DashboardModel["domainBars"], limit = 8): FifaRadarStat[] {
  return domainBars.slice(0, limit).map((row) => ({
    label: SHORT[row.domain] ?? row.label.slice(0, 3).toUpperCase(),
    value: row.insufficient || row.score == null ? null : row.score,
  }));
}
