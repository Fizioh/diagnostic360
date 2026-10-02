import { get, set } from "idb-keyval";
import type { MissionWorkspaceV1 } from "../domain/types";

const KEY = "mission2027-workspace-v1";

export function emptyWorkspace(): MissionWorkspaceV1 {
  return {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    tasks: [],
    evidence: [],
    weaknesses: [],
    retests: [],
  };
}

export async function loadWorkspace(): Promise<MissionWorkspaceV1> {
  const raw = await get<MissionWorkspaceV1>(KEY);
  if (!raw || raw.schemaVersion !== 1) return emptyWorkspace();
  return raw;
}

export async function saveWorkspace(workspace: MissionWorkspaceV1): Promise<void> {
  await set(KEY, { ...workspace, updatedAt: new Date().toISOString() });
}
