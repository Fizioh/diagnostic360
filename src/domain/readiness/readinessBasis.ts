import { isProvisionalEvidence, isValidatedPracticalEvidence } from "../evidence/evidenceModel";
import type { MissionWorkspaceV1 } from "../types";

export type ReadinessBasis = "validated" | "provisional" | "none";

export function computeReadinessBasis(workspace: MissionWorkspaceV1 | null): ReadinessBasis {
  const evidence = workspace?.evidence ?? [];
  if (evidence.some((e) => isValidatedPracticalEvidence(e))) return "validated";
  if (evidence.some((e) => isProvisionalEvidence(e) && e.validatedAt)) return "provisional";
  return "none";
}
