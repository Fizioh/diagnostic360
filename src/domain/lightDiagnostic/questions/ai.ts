import { mcq } from "./helpers";

export const aiQuestions = [
  mcq(
    "ld-ai-01",
    "ai-engineering",
    "AI Engineering",
    "medium",
    "LLM agent calls tools with user-provided URLs; SSRF risk appears in review. Mitigation?",
    [
      "Allowlist domains, block metadata IPs, sandbox egress, validate tool args server-side",
      "Trust the model",
      "Run tools as root",
      "Disable HTTPS",
    ],
    0,
    "Tool egress must be constrained like any server-side fetch.",
    ["agent security", "SSRF", "tool calling"],
  ),
  mcq(
    "ld-ai-02",
    "ai-engineering",
    "AI Engineering",
    "hard",
    "RAG answers hallucinate citations. Quality improvement with observability?",
    [
      "Increase temperature",
      "Ground answers with retrieval scores, require citation chunk match, log faithfulness evals on prod samples",
      "Remove retrieval",
      "Use longer prompts only",
    ],
    1,
    "Measured grounding + eval loops reduce unfaithful citations.",
    ["RAG", "hallucination", "evals"],
  ),
  mcq(
    "ld-ai-03",
    "ai-engineering",
    "AI Engineering",
    "medium",
    "Prompt injection via email content processed by autonomous agent. Defense in depth?",
    [
      "Separate untrusted content in delimiters, policy layer on tool permissions, human approval for destructive tools",
      "Concatenate all text as system prompt",
      "Give agent admin API keys",
      "Ignore injection as edge case",
    ],
    0,
    "Treat untrusted text as data; limit tool blast radius.",
    ["prompt injection", "agent reliability", "permissions"],
  ),
];
