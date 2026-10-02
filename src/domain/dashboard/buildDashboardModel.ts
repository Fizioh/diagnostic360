import type { DiagnosticRun } from "../../types/diagnostic";
import type { NotionPlanningSnapshot } from "../../integrations/notion/types";
import type {
  EvidenceItem,
  MissionWorkspaceV1,
  PreparationTask,
  ReadinessDomain,
  TaskStatus,
} from "../types";
import { computeAllDomains } from "../readiness/computeReadiness";
import {
  computeProfileReadiness,
  DEFAULT_TARGET_PROFILE_ID,
  type TargetProfileId,
} from "../readiness/targetProfiles";
import { tasksByStatus } from "../tasks/preparationTasks";
import { COCKPIT_DOMAIN_ROWS } from "./cockpitDomains";

export interface TodayFocus {
  title: string;
  domainLabel: string | null;
  durationLabel: string;
  reason: string;
  href: string;
  ctaLabel: string;
}

export interface WeekProgress {
  planned: number;
  completed: number;
  label: string;
}

export interface AttentionItem {
  id: string;
  title: string;
  detail: string;
  href: string;
  actionLabel: string;
}

export interface EvidenceFeedRow {
  id: string;
  title: string;
  strength: EvidenceItem["strength"];
  domain: ReadinessDomain;
  domainLabel: string;
  validatedAt: string;
  impactLabel: string;
}

export interface PipelineStage {
  status: string;
  count: number;
}

export interface EngineeringProofRow {
  title: string;
  proofType: string;
  status: string;
}

export interface DashboardModel {
  missionPhase: string | null;
  missionWeek: string | null;
  targetProfileId: TargetProfileId;
  targetProfileLabel: string;
  todayFocus: TodayFocus;
  weekProgress: WeekProgress;
  overallReadinessScore: number | null;
  overallInsufficient: boolean;
  domainBars: {
    label: string;
    domain: ReadinessDomain;
    score: number | null;
    insufficient: boolean;
  }[];
  attention: AttentionItem[];
  evidenceFeed: EvidenceFeedRow[];
  engineeringProofs: EngineeringProofRow[];
  pipelineStages: PipelineStage[];
  hasTrendHistory: boolean;
}

const DOMAIN_LABEL: Partial<Record<ReadinessDomain, string>> = Object.fromEntries(
  COCKPIT_DOMAIN_ROWS.map((r) => [r.domain, r.label]),
) as Partial<Record<ReadinessDomain, string>>;

function impactLabel(strength: EvidenceItem["strength"]): string {
  if (strength === "strong") return "High impact";
  if (strength === "medium") return "Moderate impact";
  return "Baseline signal";
}

function pickTodayFocus(
  tasks: PreparationTask[],
  workspace: MissionWorkspaceV1 | null,
  diagnosticComplete: boolean,
): TodayFocus {
  const by = tasksByStatus(tasks);
  const inProgress = by["in-progress"][0];
  if (inProgress) {
    return {
      title: inProgress.title,
      domainLabel: inProgress.domainTags[0] ? DOMAIN_LABEL[inProgress.domainTags[0]] ?? inProgress.domainTags[0] : null,
      durationLabel: "45 min",
      reason: "Already in progress — finish before starting new work.",
      href: "/today",
      ctaLabel: "Continue",
    };
  }
  const today = by.today[0];
  if (today) {
    return {
      title: today.title,
      domainLabel: today.domainTags[0] ? DOMAIN_LABEL[today.domainTags[0]] ?? null : null,
      durationLabel: "45 min",
      reason: "Scheduled for today in your preparation plan.",
      href: "/today",
      ctaLabel: "Start",
    };
  }
  const overdueRetest = workspace?.retests.find((r) => r.status === "scheduled" && r.dueAt && r.dueAt < new Date().toISOString());
  if (overdueRetest && workspace) {
    const w = workspace.weaknesses.find((x) => x.id === overdueRetest.weaknessId);
    return {
      title: w?.summary ?? "Retest due",
      domainLabel: w ? DOMAIN_LABEL[w.domain] ?? w.domain : null,
      durationLabel: "30 min",
      reason: "Overdue retest — convert remediation into validated evidence.",
      href: "/remediation",
      ctaLabel: "Run retest",
    };
  }
  const weakness = workspace?.weaknesses.find((w) => w.status === "retest-due" || w.status === "remediating");
  if (weakness) {
    return {
      title: weakness.summary,
      domainLabel: DOMAIN_LABEL[weakness.domain] ?? weakness.domain,
      durationLabel: "30 min",
      reason: "Weakness blocking readiness — remediate then schedule retest.",
      href: "/remediation",
      ctaLabel: "Remediate",
    };
  }
  if (!diagnosticComplete && (workspace?.evidence.length ?? 0) === 0) {
    return {
      title: "Diagnostic 360 baseline",
      domainLabel: null,
      durationLabel: "~3 h",
      reason: "No validated baseline yet — establish evidence-backed readiness.",
      href: "/diagnostic",
      ctaLabel: "Start Diagnostic",
    };
  }
  const week = by["this-week"][0];
  if (week) {
    return {
      title: week.title,
      domainLabel: null,
      durationLabel: "45 min",
      reason: "Top item from this week's preparation queue.",
      href: "/today",
      ctaLabel: "Start",
    };
  }
  return {
    title: "Review readiness drill-down",
    domainLabel: null,
    durationLabel: "15 min",
    reason: "No urgent task — inspect domains and plan next evidence.",
    href: "/readiness",
    ctaLabel: "Open Readiness",
  };
}

function weekProgress(tasks: PreparationTask[]): WeekProgress {
  const by = tasksByStatus(tasks);
  const active: TaskStatus[] = ["this-week", "today", "in-progress"];
  const planned = active.reduce((n, s) => n + by[s].length, 0) + by.done.length;
  const completed = by.done.length;
  const pct = planned === 0 ? 0 : Math.round((completed / planned) * 100);
  return {
    planned: planned || by.backlog.length + by["this-week"].length,
    completed,
    label: planned === 0 ? "No weekly plan loaded" : `${pct}% of tracked items done`,
  };
}

function buildAttention(workspace: MissionWorkspaceV1 | null, domains: ReturnType<typeof computeAllDomains>): AttentionItem[] {
  const items: AttentionItem[] = [];
  if (!workspace) return items;

  for (const w of workspace.weaknesses.filter((x) => x.status !== "mastered")) {
    items.push({
      id: `w-${w.id}`,
      title: w.summary,
      detail: `${DOMAIN_LABEL[w.domain] ?? w.domain} · ${w.status}`,
      href: "/remediation",
      actionLabel: "Open remediation",
    });
  }

  for (const r of workspace.retests.filter((x) => x.status === "scheduled")) {
    const w = workspace.weaknesses.find((x) => x.id === r.weaknessId);
    const overdue = r.dueAt && r.dueAt < new Date().toISOString();
    items.push({
      id: `r-${r.id}`,
      title: w?.summary ?? "Scheduled retest",
      detail: overdue ? "Retest overdue" : "Retest scheduled",
      href: "/remediation",
      actionLabel: "View retest",
    });
  }

  for (const d of domains) {
    if (d.calibration === "overconfident") {
      items.push({
        id: `cal-over-${d.domain}`,
        title: `Confidence calibration · ${d.label}`,
        detail: "Self-confidence exceeds validated review strength.",
        href: `/readiness?domain=${d.domain}`,
        actionLabel: "Explain",
      });
    }
    if (d.calibration === "underconfident") {
      items.push({
        id: `cal-under-${d.domain}`,
        title: `Confidence calibration · ${d.label}`,
        detail: "Validated performance stronger than self-confidence.",
        href: `/readiness?domain=${d.domain}`,
        actionLabel: "Explain",
      });
    }
  }

  return items.slice(0, 8);
}

function evidenceFeed(evidence: EvidenceItem[]): EvidenceFeedRow[] {
  return evidence
    .filter((e) => e.validatedAt)
    .sort((a, b) => (b.validatedAt ?? "").localeCompare(a.validatedAt ?? ""))
    .slice(0, 6)
    .map((e) => ({
      id: e.id,
      title: e.title,
      strength: e.strength,
      domain: e.domain,
      domainLabel: DOMAIN_LABEL[e.domain] ?? e.domain,
      validatedAt: e.validatedAt!,
      impactLabel: impactLabel(e.strength),
    }));
}

function pipelineStages(snapshot: NotionPlanningSnapshot | null): PipelineStage[] {
  if (!snapshot?.pipeline.length) return [];
  const counts = new Map<string, number>();
  for (const p of snapshot.pipeline) {
    counts.set(p.status, (counts.get(p.status) ?? 0) + 1);
  }
  return [...counts.entries()].map(([status, count]) => ({ status, count }));
}

export function buildDashboardModel(input: {
  workspace: MissionWorkspaceV1 | null;
  tasks: PreparationTask[];
  snapshot: NotionPlanningSnapshot | null;
  diagnosticRun: DiagnosticRun | null;
  targetProfileId?: TargetProfileId;
}): DashboardModel {
  const targetProfileId = input.targetProfileId ?? DEFAULT_TARGET_PROFILE_ID;
  const evidence = input.workspace?.evidence ?? [];
  const asOf = new Date();
  const domains = computeAllDomains(evidence, asOf);
  const profile = computeProfileReadiness(targetProfileId, evidence);
  const byDomain = new Map(domains.map((d) => [d.domain, d]));

  const diagnosticComplete = input.diagnosticRun?.status === "complete";

  const roadmap = input.snapshot?.roadmap[0];

  return {
    missionPhase: roadmap?.phase ?? roadmap?.title ?? null,
    missionWeek: input.snapshot?.preparationTasks.find((t) => t.week)?.week ?? null,
    targetProfileId,
    targetProfileLabel: profile.label,
    todayFocus: pickTodayFocus(input.tasks, input.workspace, diagnosticComplete),
    weekProgress: weekProgress(input.tasks),
    overallReadinessScore: profile.insufficientEvidence ? null : profile.score,
    overallInsufficient: profile.insufficientEvidence,
    domainBars: COCKPIT_DOMAIN_ROWS.map(({ label, domain }) => {
      const d = byDomain.get(domain);
      return {
        label,
        domain,
        score: d?.insufficientEvidence ? null : (d?.score ?? null),
        insufficient: d?.insufficientEvidence ?? true,
      };
    }),
    attention: buildAttention(input.workspace, domains),
    evidenceFeed: evidenceFeed(evidence),
    engineeringProofs: (input.snapshot?.engineeringProofs ?? []).slice(0, 8),
    pipelineStages: pipelineStages(input.snapshot),
    hasTrendHistory: false,
  };
}
