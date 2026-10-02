import type { ModuleMeta } from "../types/diagnostic";

export const MODULES: ModuleMeta[] = [
  { id: "coding", title: "Coding fundamentals", durationMinutes: 30, points: 12, aiAllowed: false },
  { id: "react-ts", title: "React / TypeScript", durationMinutes: 35, points: 10, aiAllowed: false },
  { id: "django-sql", title: "Django / SQL", durationMinutes: 45, points: 12, aiAllowed: false },
  { id: "code-review", title: "Code review", durationMinutes: 45, points: 10, aiAllowed: false },
  { id: "system-design", title: "System design", durationMinutes: 60, points: 15, aiAllowed: false },
  { id: "production", title: "Production incident", durationMinutes: 30, points: 10, aiAllowed: false },
  { id: "ai-engineering", title: "AI engineering", durationMinutes: 40, points: 10, aiAllowed: true },
  { id: "gis", title: "GIS architecture", durationMinutes: 20, points: 8, aiAllowed: false },
  { id: "communication", title: "Senior communication", durationMinutes: 20, points: 8, aiAllowed: false },
  { id: "english", title: "Technical English", durationMinutes: 15, points: 5, aiAllowed: false },
];

export const TOTAL_POINTS = MODULES.reduce((s, m) => s + m.points, 0);
export const ESTIMATED_MINUTES = MODULES.reduce((s, m) => s + m.durationMinutes, 0);
