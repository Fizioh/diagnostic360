import { mcq } from "./helpers";

export const aiQuestions = [
  mcq(
    "ld-ai-01",
    "ai-engineering",
    "AI Engineering",
    "medium",
    "LLM agent calls tools with user-provided URLs; SSRF risk appears in review. Mitigation?",
    [
      "Allowlist outbound domains, block metadata IPs, sandbox egress, and validate tool args server-side",
      "Trust the model to refuse internal URLs because system prompts already describe acceptable targets",
      "Run tool handlers as root on the host so the kernel blocks connections to private network ranges",
      "Disable TLS verification on tool fetches so redirects to internal hosts fail fast with clear errors",
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
      "Raise sampling temperature so the model explores more phrasing and cites diverse retrieved chunks",
      "Ground answers with retrieval scores, require cited chunk matches, and log faithfulness evals on samples",
      "Remove retrieval entirely and rely on parametric knowledge so citations are no longer inconsistent",
      "Lengthen the system prompt with citation rules only, without measuring match quality in production",
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
      "Isolate untrusted content with delimiters, enforce tool permission policies, and gate destructive tools",
      "Merge all email text into the system prompt so instructions and user content share one trusted block",
      "Grant the agent broad admin API keys so it can complete tasks without repeated human approval steps",
      "Treat injection as rare noise and depend on the base model refusal training to ignore embedded orders",
    ],
    0,
    "Treat untrusted text as data; limit tool blast radius.",
    ["prompt injection", "agent reliability", "permissions"],
  ),
];
