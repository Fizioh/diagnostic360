import type { DomainEvent, EvidenceItem, MissionWorkspaceV1, WeaknessItem } from "../types";

function defaultDueAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString();
}

export function startRemediation(
  workspace: MissionWorkspaceV1,
  weaknessId: string,
  remediation: string,
): MissionWorkspaceV1 {
  const at = new Date().toISOString();
  const weaknesses = workspace.weaknesses.map((w) =>
    w.id === weaknessId ? { ...w, status: "remediating" as const, remediation } : w,
  );
  return { ...workspace, weaknesses, updatedAt: at };
}

export function scheduleRetest(
  workspace: MissionWorkspaceV1,
  weaknessId: string,
  dueAt?: string,
): MissionWorkspaceV1 {
  const at = new Date().toISOString();
  const weaknesses = workspace.weaknesses.map((w) =>
    w.id === weaknessId ? { ...w, status: "retest-due" as const } : w,
  );
  const existing = workspace.retests.find(
    (r) => r.weaknessId === weaknessId && r.status === "scheduled",
  );
  const retests = existing
    ? workspace.retests
    : [
        ...workspace.retests,
        {
          id: crypto.randomUUID(),
          weaknessId,
          dueAt: dueAt ?? defaultDueAt(),
          status: "scheduled" as const,
        },
      ];
  return { ...workspace, weaknesses, retests, updatedAt: at };
}

export function passRetest(
  workspace: MissionWorkspaceV1,
  retestId: string,
): { workspace: MissionWorkspaceV1; event: DomainEvent } {
  const at = new Date().toISOString();
  const retest = workspace.retests.find((r) => r.id === retestId);
  if (!retest) throw new Error("Retest not found");
  const weakness = workspace.weaknesses.find((w) => w.id === retest.weaknessId);
  if (!weakness) throw new Error("Weakness not found");

  const evidence: EvidenceItem = {
    id: crypto.randomUUID(),
    domain: weakness.domain,
    strength: "strong",
    title: `Retest passed · ${weakness.summary.slice(0, 48)}`,
    description: weakness.remediation ?? "Validated via structured retest.",
    validatedAt: at,
    sourceType: "retest",
  };

  const retests = workspace.retests.map((r) =>
    r.id === retestId ? { ...r, status: "passed" as const } : r,
  );
  const weaknesses = workspace.weaknesses.map((w) =>
    w.id === weakness.id ? { ...w, status: "mastered" as const } : w,
  );
  const errorLog = (workspace.errorLog ?? []).map((e) =>
    e.weaknessId === weakness.id ? { ...e, status: "mastered" as const } : e,
  );

  return {
    workspace: {
      ...workspace,
      evidence: [...workspace.evidence, evidence],
      retests,
      weaknesses,
      errorLog,
      updatedAt: at,
    },
    event: { type: "RetestPassed", retestId, at },
  };
}

export function failRetest(workspace: MissionWorkspaceV1, retestId: string): MissionWorkspaceV1 {
  const at = new Date().toISOString();
  const retest = workspace.retests.find((r) => r.id === retestId);
  if (!retest) throw new Error("Retest not found");
  const retests = workspace.retests.map((r) =>
    r.id === retestId ? { ...r, status: "failed" as const } : r,
  );
  const weaknesses = workspace.weaknesses.map((w) =>
    w.id === retest.weaknessId ? { ...w, status: "retest-due" as const } : w,
  );
  return { ...workspace, retests, weaknesses, updatedAt: at };
}

export function openWeaknessWithRetest(
  workspace: MissionWorkspaceV1,
  weakness: Omit<WeaknessItem, "status">,
): MissionWorkspaceV1 {
  const item: WeaknessItem = { ...weakness, status: "retest-due" };
  const retest = {
    id: crypto.randomUUID(),
    weaknessId: item.id,
    dueAt: defaultDueAt(),
    status: "scheduled" as const,
  };
  return {
    ...workspace,
    weaknesses: [...workspace.weaknesses, item],
    retests: [...workspace.retests, retest],
    updatedAt: new Date().toISOString(),
  };
}
