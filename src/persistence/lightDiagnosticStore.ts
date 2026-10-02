import { get, set, del } from "idb-keyval";
import type { LightDiagnosticSession } from "../domain/lightDiagnostic/types";

const KEY = "mission2027-light-diagnostic-v1";

export async function loadLightDiagnosticSession(): Promise<LightDiagnosticSession | null> {
  const raw = await get<LightDiagnosticSession>(KEY);
  if (!raw || raw.schemaVersion !== 1) return null;
  return raw;
}

export async function saveLightDiagnosticSession(session: LightDiagnosticSession): Promise<void> {
  await set(KEY, session);
}

export async function clearLightDiagnosticSession(): Promise<void> {
  await del(KEY);
}
