import { describe, expect, it } from "vitest";
import { emptyWorkspace } from "../../persistence/workspaceStore";
import { mergePreparationTasks, upsertTaskStatus } from "./preparationTasks";
import type { PreparationTask } from "../types";

const notionTask: PreparationTask = {
  id: "notion-prep-0",
  title: "From Notion",
  status: "today",
  source: "notion",
  domainTags: [],
};

describe("preparationTasks", () => {
  it("local workspace overrides notion status", () => {
    const local: PreparationTask = { ...notionTask, status: "done", source: "notion" };
    const merged = mergePreparationTasks([notionTask], [local]);
    expect(merged).toHaveLength(1);
    expect(merged[0].status).toBe("done");
  });

  it("TaskCompleted on done transition", () => {
    const ws = emptyWorkspace();
    const { workspace, event } = upsertTaskStatus(ws, notionTask, "done");
    expect(event?.type).toBe("TaskCompleted");
    expect(workspace.tasks.find((t) => t.id === notionTask.id)?.completedAt).toBeTruthy();
  });
});
