import type { LightDiagnosticQuestion } from "./types";

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function presentLightQuestion(
  question: LightDiagnosticQuestion,
  sessionId: string,
): {
  question: LightDiagnosticQuestion;
  originalChoiceIndex: (displayIndex: number) => number;
} {
  const rand = mulberry32(hashSeed(`${sessionId}:${question.id}`));
  const order: [0, 1, 2, 3] = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const choices = order.map((i) => question.choices[i]) as LightDiagnosticQuestion["choices"];
  return {
    question: { ...question, choices },
    originalChoiceIndex: (displayIndex) => order[displayIndex] ?? displayIndex,
  };
}

export function choiceLengthOutlier(question: LightDiagnosticQuestion): boolean {
  const lens = question.choices.map((c) => c.length);
  const correct = lens[question.correctIndex];
  const others = lens.filter((_, i) => i !== question.correctIndex);
  const maxOther = Math.max(...others);
  const avgOther = others.reduce((a, b) => a + b, 0) / others.length;
  return correct > maxOther + 10 || correct > avgOther * 1.22;
}
