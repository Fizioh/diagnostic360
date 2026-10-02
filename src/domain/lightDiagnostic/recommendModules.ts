import type { ModuleId } from "../../types/diagnostic";
import type { ReadinessDomain } from "../types";

const DOMAIN_TO_360: Partial<Record<ReadinessDomain, ModuleId[]>> = {
  "react-typescript": ["react-ts"],
  algorithms: ["coding"],
  django: ["django-sql"],
  "sql-postgresql": ["django-sql"],
  "system-design": ["system-design"],
  "distributed-systems": ["system-design", "production"],
  "production-devops": ["production"],
  debugging: ["code-review"],
  "ai-engineering": ["ai-engineering"],
  gis: ["gis"],
  "senior-communication": ["communication", "english"],
};

export function recommendDiagnostic360Modules(domains: ReadinessDomain[]): ModuleId[] {
  const set = new Set<ModuleId>();
  for (const d of domains) {
    for (const m of DOMAIN_TO_360[d] ?? []) set.add(m);
  }
  return [...set];
}
