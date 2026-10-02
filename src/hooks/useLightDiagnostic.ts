import { useCallback, useEffect, useState } from "react";
import {
  createLightDiagnosticSession,
  pauseLightSession,
  recordLightAnswer,
  resetLightSession,
  resumeLightSession,
} from "../domain/lightDiagnostic/session";
import type { LightDiagnosticSession } from "../domain/lightDiagnostic/types";
import {
  clearLightDiagnosticSession,
  loadLightDiagnosticSession,
  saveLightDiagnosticSession,
} from "../persistence/lightDiagnosticStore";

export function useLightDiagnostic() {
  const [session, setSession] = useState<LightDiagnosticSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLightDiagnosticSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (next: LightDiagnosticSession) => {
    setSession(next);
    await saveLightDiagnosticSession(next);
  }, []);

  const startNew = useCallback(async () => {
    const s = createLightDiagnosticSession();
    await persist(s);
    return s;
  }, [persist]);

  const reset = useCallback(async () => {
    await clearLightDiagnosticSession();
    const s = resetLightSession();
    await persist(s);
  }, [persist]);

  const pause = useCallback(async () => {
    if (!session) return;
    await persist(pauseLightSession(session));
  }, [session, persist]);

  const resume = useCallback(async () => {
    if (!session) return;
    await persist(resumeLightSession(session));
  }, [session, persist]);

  const submitAnswer = useCallback(
    async (
      question: Parameters<typeof recordLightAnswer>[1],
      choiceIndex: number,
      confidence: 1 | 2 | 3 | 4 | 5,
    ) => {
      if (!session) return null;
      const next = recordLightAnswer(session, question, choiceIndex, confidence);
      await persist(next);
      return next;
    },
    [session, persist],
  );

  return { session, loading, startNew, reset, pause, resume, submitAnswer, persist };
}
