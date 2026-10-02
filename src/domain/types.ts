export type ReadinessDomain =
  | "algorithms"
  | "react-typescript"
  | "python"
  | "django"
  | "sql-postgresql"
  | "system-design"
  | "distributed-systems"
  | "production-devops"
  | "debugging"
  | "ai-engineering"
  | "gis"
  | "technical-english"
  | "senior-communication"
  | "behavioral-leadership"
  | "public-engineering-proof";

export type EvidenceStrength = "strong" | "medium" | "weak";

export type TaskStatus =
  | "backlog"
  | "this-week"
  | "today"
  | "in-progress"
  | "done";

export interface PreparationTask {
  id: string;
  title: string;
  status: TaskStatus;
  source: "local" | "notion";
  domainTags: ReadinessDomain[];
  completedAt?: string;
}

export interface EvidenceItem {
  id: string;
  domain: ReadinessDomain;
  strength: EvidenceStrength;
  title: string;
  description: string;
  validatedAt?: string;
  confidence?: number;
  sourceType: "diagnostic" | "retest" | "mock-interview" | "oss" | "document" | "task";
}

export interface WeaknessItem {
  id: string;
  domain: ReadinessDomain;
  summary: string;
  cause?: string;
  remediation?: string;
  status: "open" | "remediating" | "retest-due" | "mastered";
  createdAt: string;
}

export interface ErrorLogEntry {
  id: string;
  weaknessId: string;
  sourceRunId: string;
  domain: ReadinessDomain;
  errorType: string;
  summary: string;
  cause?: string;
  remediation?: string;
  initialScore: number | null;
  createdAt: string;
  status: "open" | "mastered";
}

export interface RetestItem {
  id: string;
  weaknessId: string;
  dueAt?: string;
  status: "scheduled" | "passed" | "failed";
}

export interface ReadinessDomainView {
  domain: ReadinessDomain;
  label: string;
  score: number | null;
  confidence: number | null;
  evidenceCount: number;
  trend: "up" | "down" | "flat" | "unknown";
  insufficientEvidence: boolean;
}

export interface MissionWorkspaceV1 {
  schemaVersion: 1;
  updatedAt: string;
  tasks: PreparationTask[];
  evidence: EvidenceItem[];
  weaknesses: WeaknessItem[];
  retests: RetestItem[];
  errorLog: ErrorLogEntry[];
}

export type DomainEvent =
  | { type: "TaskCompleted"; taskId: string; at: string }
  | { type: "EvidenceRecorded"; evidenceId: string; at: string }
  | { type: "WeaknessOpened"; weaknessId: string; at: string }
  | { type: "RetestPassed"; retestId: string; at: string };
