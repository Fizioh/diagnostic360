import type { NotionAdapter } from "./NotionAdapter";
import type { NotionPlanningSnapshot } from "./types";

export class FixtureNotionAdapter implements NotionAdapter {
  async fetchPlanningSnapshot(): Promise<NotionPlanningSnapshot> {
    return {
      fetchedAt: new Date().toISOString(),
      source: "fixture",
      roadmap: [
        { title: "Diagnostic 360 baseline", phase: "Oct 2026", status: "In progress" },
        { title: "Readiness feedback loop", phase: "Nov 2026", status: "Planned" },
        { title: "Mission pipeline active", phase: "Jan 2027", status: "Planned" },
      ],
      preparationTasks: [
        { title: "Complete Diagnostic module 1–3", status: "Today", week: "W40" },
        { title: "DDIA chapter + system design drill", status: "This week", week: "W40" },
      ],
      pipeline: [{ company: "—", role: "Senior Full-Stack / GIS", status: "Preparing" }],
      errorLog: [],
      learning: [{ title: "Designing Data-Intensive Applications", type: "Book", status: "Reading" }],
      engineeringProofs: [
        { title: "Mission 2027 Control Center (local)", proofType: "Product", status: "Building" },
      ],
    };
  }
}
